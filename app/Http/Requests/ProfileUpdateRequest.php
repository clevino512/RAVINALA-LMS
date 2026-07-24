<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $passwordChangeRequired = (bool) $this->user()?->must_change_password;

        return [
            'first_name' => ['required', 'string', 'max:250'],
            'last_name' => ['nullable', 'string', 'max:250'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'sex' => ['nullable', Rule::in(['homme', 'femme', 'autre'])],
            'current_password' => [
                Rule::requiredIf($passwordChangeRequired),
                'nullable',
                'required_with:password,password_confirmation',
                'current_password',
            ],
            'password' => [
                Rule::requiredIf($passwordChangeRequired),
                'nullable',
                'required_with:current_password,password_confirmation',
                'confirmed',
                Password::defaults(),
            ],
            'password_confirmation' => [
                Rule::requiredIf($passwordChangeRequired),
                'nullable',
                'required_with:password',
            ],
        ];
    }
}
