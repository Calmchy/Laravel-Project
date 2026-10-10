<?php

namespace Database\Seeders;

use App\Models\AnnouncementCategory;
use App\Models\ChatbotIntent;
use App\Models\City;
use App\Models\IdType;
use App\Models\Province;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

/**
 * Reference data. Safe to run more than once (uses firstOrCreate).
 * Roles are created by their migration, not here.
 */
class LookupSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Philippine National ID (PhilSys)', 'Passport', "Driver's License", 'UMID',
            'SSS ID', 'Postal ID', "Voter's ID", 'PRC ID', 'School ID', 'Senior Citizen ID',
        ] as $name) {
            IdType::firstOrCreate(['name' => $name]);
        }

        // Eastern Visayas (Region 8) to start; add more provinces/cities as you grow.
        // Each city carries an approximate centre point [lat, lng] used to centre the booking map.
        $places = [
            'Leyte' => ['Tacloban City' => [11.2444, 125.0036], 'Ormoc City' => [11.0064, 124.6075], 'Baybay City' => [10.6781, 124.8003], 'Abuyog' => [10.7436, 125.0092]],
            'Southern Leyte' => ['Maasin City' => [10.1322, 124.8420]],
            'Biliran' => ['Naval' => [11.5617, 124.4017]],
            'Samar' => ['Catbalogan City' => [11.7753, 124.8861]],
            'Eastern Samar' => ['Borongan City' => [11.6078, 125.4331]],
            'Northern Samar' => [],
        ];
        foreach ($places as $province => $cities) {
            $p = Province::firstOrCreate(['name' => $province]);
            foreach ($cities as $city => [$lat, $lng]) {
                // updateOrCreate so re-seeding also fills coordinates on existing rows
                City::updateOrCreate(['province_id' => $p->id, 'name' => $city], ['latitude' => $lat, 'longitude' => $lng]);
            }
        }

        foreach (['LPT', 'CSE', 'TESDA', 'Other Exams', 'General'] as $name) {
            AnnouncementCategory::firstOrCreate(['name' => $name]);
        }

        $vehicles = [
            'Toyota' => ['Vios', 'Innova', 'Hiace'],
            'Mitsubishi' => ['Xpander', 'L300'],
            'Nissan' => ['Urvan'],
            'Suzuki' => ['Ertiga'],
        ];
        foreach ($vehicles as $make => $models) {
            $m = VehicleMake::firstOrCreate(['name' => $make]);
            foreach ($models as $model) {
                VehicleModel::firstOrCreate(['make_id' => $m->id, 'name' => $model]);
            }
        }

        $intents = [
            'how_to_book' => [
                'Search a ride, tap Reserve, and wait for the driver to approve. Once confirmed, you will get a reference number.',
                ['book', 'reserve'],
            ],
            'id_required' => [
                "Passengers must upload a valid ID and get it approved before booking. Drivers also upload their driver's license.",
                ['id', 'verify'],
            ],
            'cancellation' => [
                'You can cancel from My Bookings. Please cancel early so the driver can free up your seat.',
                ['cancel'],
            ],
            'payment' => [
                'Payment is cash-on-ride for now. Pay the driver directly on the day of the trip.',
                ['pay', 'price'],
            ],
        ];
        foreach ($intents as $name => [$answer, $keywords]) {
            $intent = ChatbotIntent::firstOrCreate(['name' => $name], ['answer' => $answer]);
            foreach ($keywords as $keyword) {
                $intent->keywords()->firstOrCreate(['keyword' => $keyword]);
            }
        }
    }
}
