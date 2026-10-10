<?php

use App\Actions\Bookings\ReserveSeat;
use App\Enums\ApprovalStatus;
use App\Enums\BookingStatus;
use App\Enums\ReviewerRole;
use App\Models\Booking;
use App\Models\ChatbotIntent;
use App\Models\City;
use App\Models\DriverProfile;
use App\Models\IdentityDocument;
use App\Models\IdType;
use App\Models\Review;
use App\Models\Ride;
use App\Models\Role;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use Database\Seeders\LookupSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(LookupSeeder::class);
});

/** Helpers ---------------------------------------------------------------- */
function makeDriver(): User
{
    $driver = User::factory()->create(['role_id' => Role::DRIVER]);
    DriverProfile::create([
        'user_id' => $driver->id,
        'license_number' => 'N01-'.fake()->unique()->numerify('##-######'),
        'license_expiry' => now()->addYears(3),
        'license_image_path' => 'licenses/test.jpg',
        'status' => ApprovalStatus::Approved,
    ]);

    return $driver;
}

function makeRide(User $driver, array $overrides = []): Ride
{
    $vehicle = Vehicle::create([
        'driver_id' => $driver->id,
        'model_id' => VehicleModel::first()->id,
        'color' => 'White',
        'plate_number' => 'ABC '.fake()->unique()->numerify('####'),
        'seat_capacity' => 10,
    ]);

    return Ride::create([
        'vehicle_id' => $vehicle->id,
        'origin_city_id' => City::where('name', 'Abuyog')->value('id'),
        'destination_city_id' => City::where('name', 'Tacloban City')->value('id'),
        'pickup_point' => 'Abuyog Public Market',
        'departure_at' => now()->addDays(3),
        'seats_offered' => 3,
        'price_per_seat' => 250,
        ...$overrides,
    ]);
}

function verifiedPassenger(): User
{
    $passenger = User::factory()->create();
    IdentityDocument::create([
        'user_id' => $passenger->id,
        'id_type_id' => IdType::first()->id,
        'front_image_path' => 'ids/front.jpg',
        'status' => ApprovalStatus::Approved,
    ]);

    return $passenger;
}

/** Schema / users reuse ----------------------------------------------------- */
test('all carpool tables exist and the original users table is reused', function () {
    foreach ([
        'roles', 'users', 'id_types', 'identity_documents', 'driver_profiles',
        'vehicle_makes', 'vehicle_models', 'vehicles', 'provinces', 'cities',
        'announcement_categories', 'announcements', 'rides', 'bookings', 'reviews',
        'banners', 'chatbot_intents', 'chatbot_keywords',
        'sessions', 'passkeys', // framework tables are untouched
    ] as $table) {
        expect(Schema::hasTable($table))->toBeTrue("missing table: {$table}");
    }

    // original columns kept, carpool columns added
    expect(Schema::hasColumns('users', [
        'name', 'email', 'password', 'two_factor_secret',
        'role_id', 'phone_number', 'profile_photo_path', 'account_status',
    ]))->toBeTrue();
});

test('new users default to the passenger role and an active account', function () {
    $user = User::factory()->create()->fresh();

    expect($user->role_id)->toBe(Role::PASSENGER)
        ->and($user->isPassenger())->toBeTrue()
        ->and($user->account_status->value)->toBe('active');
});

test('registration through Fortify still works and creates a passenger', function () {
    $this->post(route('register.store'), [
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
        'password' => 'password-123-ABC',
        'password_confirmation' => 'password-123-ABC',
    ]);

    expect(User::where('email', 'maria@example.com')->first()?->isPassenger())->toBeTrue();
});

test('ID verification is derived from an approved document', function () {
    $user = User::factory()->create();
    expect($user->hasApprovedId())->toBeFalse();

    $doc = IdentityDocument::create([
        'user_id' => $user->id,
        'id_type_id' => IdType::first()->id,
        'front_image_path' => 'ids/front.jpg',
    ]);
    expect($user->hasApprovedId())->toBeFalse(); // still pending

    $doc->update(['status' => ApprovalStatus::Approved]);
    expect($user->hasApprovedId())->toBeTrue();
});

test('lookup seeder is idempotent', function () {
    $before = [City::count(), IdType::count(), ChatbotIntent::count()];
    $this->seed(LookupSeeder::class);

    expect([City::count(), IdType::count(), ChatbotIntent::count()])->toBe($before);
});

/** Booking flow ------------------------------------------------------------- */
test('a passenger without an approved ID cannot book', function () {
    $ride = makeRide(makeDriver());

    (new ReserveSeat)->handle(User::factory()->create(), $ride);
})->throws(ValidationException::class);

test('reserving creates a pending booking with a reference number and fare snapshot', function () {
    $ride = makeRide(makeDriver());

    $booking = (new ReserveSeat)->handle(verifiedPassenger(), $ride, 2);

    expect($booking->status)->toBe(BookingStatus::Pending)
        ->and($booking->reference_no)->toStartWith('RNP-'.now()->format('Ymd').'-')
        ->and($booking->fare_per_seat)->toBe('250.00')
        ->and($booking->totalFare())->toBe('500.00');

    // price changes later; the old booking keeps its snapshot
    $ride->update(['price_per_seat' => 400]);
    expect($booking->fresh()->fare_per_seat)->toBe('250.00');
});

test('seats left is calculated and ignores cancelled bookings', function () {
    $ride = makeRide(makeDriver()); // 3 seats

    $first = (new ReserveSeat)->handle(verifiedPassenger(), $ride, 2);
    expect($ride->seatsLeft())->toBe(1);

    $first->update(['status' => BookingStatus::Cancelled]);
    expect($ride->fresh()->seatsLeft())->toBe(3);
});

test('overbooking is blocked', function () {
    $ride = makeRide(makeDriver()); // 3 seats

    (new ReserveSeat)->handle(verifiedPassenger(), $ride, 2);
    (new ReserveSeat)->handle(verifiedPassenger(), $ride, 2);
})->throws(ValidationException::class, 'Not enough seats');

test('the same passenger cannot book the same ride twice', function () {
    $ride = makeRide(makeDriver());
    $passenger = verifiedPassenger();

    (new ReserveSeat)->handle($passenger, $ride);
    (new ReserveSeat)->handle($passenger, $ride);
})->throws(ValidationException::class, 'already have a booking');

test('a driver cannot book their own ride', function () {
    $driver = makeDriver();
    IdentityDocument::create([
        'user_id' => $driver->id,
        'id_type_id' => IdType::first()->id,
        'front_image_path' => 'ids/front.jpg',
        'status' => ApprovalStatus::Approved,
    ]);

    (new ReserveSeat)->handle($driver, makeRide($driver));
})->throws(ValidationException::class, 'own ride');

test('the withSeatsLeft scope hides full rides', function () {
    $driver = makeDriver();
    $open = makeRide($driver, ['seats_offered' => 2]);
    $full = makeRide($driver, ['seats_offered' => 1]);

    (new ReserveSeat)->handle(verifiedPassenger(), $full, 1);

    $ids = Ride::query()->available()->withSeatsLeft()->pluck('id');
    expect($ids->all())->toBe([$open->id]);
});

test('the driver is reachable through the vehicle', function () {
    $driver = makeDriver();
    $ride = makeRide($driver);

    expect(Ride::with('vehicle.driver.user')->find($ride->id)->vehicle->driver->user->is($driver))->toBeTrue();
});

/** Reviews, chatbot --------------------------------------------------------- */
test('one review per side per booking', function () {
    $ride = makeRide(makeDriver());
    $booking = (new ReserveSeat)->handle(verifiedPassenger(), $ride);

    Review::create(['booking_id' => $booking->id, 'reviewer_role' => ReviewerRole::Passenger, 'rating' => 5]);
    Review::create(['booking_id' => $booking->id, 'reviewer_role' => ReviewerRole::Driver, 'rating' => 4]);

    expect($booking->reviews()->count())->toBe(2);

    Review::create(['booking_id' => $booking->id, 'reviewer_role' => ReviewerRole::Passenger, 'rating' => 1]);
})->throws(QueryException::class);

test('booking references are unique', function () {
    $ride = makeRide(makeDriver());
    $a = (new ReserveSeat)->handle(verifiedPassenger(), $ride);

    Booking::create([
        'reference_no' => $a->reference_no,
        'ride_id' => $ride->id,
        'passenger_id' => verifiedPassenger()->id,
        'fare_per_seat' => 250,
    ]);
})->throws(QueryException::class);

test('chatbot matches whole words only', function () {
    expect(ChatbotIntent::replyFor('How do I pay?'))->toContain('cash-on-ride')
        ->and(ChatbotIntent::replyFor('I already paid'))->toBeNull() // "id" must not match inside "paid"
        ->and(ChatbotIntent::replyFor('Is my ID needed?'))->toContain('valid ID')
        ->and(ChatbotIntent::replyFor('blah blah'))->toBeNull();
});
