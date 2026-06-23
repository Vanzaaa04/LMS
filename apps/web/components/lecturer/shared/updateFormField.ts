import type React from 'react';

export function updateFormField<FormState, FieldKey extends keyof FormState>(
  key: FieldKey,
  value: FormState[FieldKey],
  setFormState: React.Dispatch<React.SetStateAction<FormState>>
) {
  setFormState((currentState) => ({
    ...currentState,
    [key]: value,
  }));
}
