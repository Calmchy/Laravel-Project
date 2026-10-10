<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The booking form a passenger fills out when reserving seats.
 * Every field is validated on the server (the React form is only a convenience).
 */
class StoreBookingRequest extends FormRequest
{
    /** Must be logged in; the finer rules (ID approved, seats free...) live in ReserveSeat. */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'seats' => ['required', 'integer', 'min:1', 'max:6'],

            // --- who is travelling ---
            'contact_name' => ['required', 'string', 'max:100'],
            'contact_address' => ['required', 'string', 'max:200'],
            'contact_email' => ['required', 'email:rfc', 'max:150'],
            // Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
            'contact_phone' => ['required', 'regex:/^(\+63|0)9\d{9}$/'],

            // --- where and when ---
            'pickup_location' => ['required', 'string', 'max:200'],
            'pickup_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'pickup_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'pickup_at' => ['required', 'date', 'after_or_equal:today'],

            'return_location' => ['required', 'string', 'max:200'],
            'return_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'return_lng' => ['nullable', 'numeric', 'between:-180,180'],
            // A return can't be before the pick-up
            'return_at' => ['required', 'date', 'after_or_equal:pickup_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'contact_phone.regex' => 'Enter a Philippine mobile number like 09123456789.',
            'return_at.after_or_equal' => 'The return date must be on or after the pick-up date.',
        ];
    }

    /** Strip tags/whitespace from free text before it is stored (defence in depth; React escapes on output). */
    protected function prepareForValidation(): void
    {
        foreach (['contact_name', 'contact_address', 'pickup_location', 'return_location'] as $key) {
            if (is_string($this->input($key))) {
                $this->merge([$key => trim(strip_tags($this->input($key)))]);
            }
        }
    }
}
