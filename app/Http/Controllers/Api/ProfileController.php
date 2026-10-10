<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /** Return the current user's own profile, including verification state only. */
    public function show(Request $request)
    {
        return response()->json($request->user()->makeVisible([
            'role', 'address', 'contact_number', 'identity_status', 'driver_status',
            'vehicle_type', 'vehicle_plate', 'seats'
        ])->makeHidden(['identity_document_path']));
    }

    /** Update editable profile fields without allowing role or verification escalation. */
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_number' => ['sometimes', 'nullable', 'string', 'max:30'],
            'vehicle_type' => ['sometimes', 'nullable', 'string', 'max:80'],
            'vehicle_plate' => ['sometimes', 'nullable', 'string', 'max:30'],
            'seats' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:20'],
        ]);
        $request->user()->update($data);
        return $this->show($request);
    }

    /** Store ID files on a private disk and mark them pending manual review. */
    public function uploadIdentityDocument(Request $request)
    {
        $request->validate([
            'identity_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);
        $user = $request->user();
        $path = $request->file('identity_document')->store('identity-documents', 'local');
        $user->update(['identity_document_path' => $path, 'identity_status' => 'pending']);
        return response()->json(['message' => 'ID submitted for review.', 'identity_status' => 'pending'], 202);
    }
}
