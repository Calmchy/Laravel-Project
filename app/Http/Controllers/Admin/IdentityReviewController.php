<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Models\IdentityDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IdentityReviewController extends Controller
{
    /** GET /admin/identity-documents/{document}/{side} : stream the private image to an admin only. */
    public function image(Request $request, IdentityDocument $document, string $side): StreamedResponse
    {
        abort_unless(in_array($side, ['front', 'back'], true), 404);
        $path = $side === 'front' ? $document->front_image_path : $document->back_image_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        // Audit trail: who looked at whose ID, and when.
        Log::info('identity_document_viewed', ['admin_id' => $request->user()->id, 'document_id' => $document->id, 'side' => $side]);

        return Storage::disk('local')->response($path, null, [
            'Cache-Control' => 'no-store, private',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /** PATCH /admin/identity-documents/{document} : approve or reject (with an optional remark shown to the user). */
    public function decide(Request $request, IdentityDocument $document): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ]);

        abort_unless($document->status === ApprovalStatus::Pending, 409);

        $document->forceFill([
            'status' => $data['decision'],
            'remarks' => $data['remarks'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();

        $this->toast("ID {$data['decision']}.");

        return back();
    }
}
