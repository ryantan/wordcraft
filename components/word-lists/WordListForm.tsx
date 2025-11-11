'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { validateWordListInput, VALIDATION_LIMITS } from '@/lib/utils/validation';
import type { WordListCreateInput } from '@/types';
import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';

interface WordListFormProps {
  initialData?: {
    name: string;
    description?: string;
    words: string[];
  };
  onSubmit: (data: WordListCreateInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

interface FormData {
  name: string;
  description: string;
  wordsText: string;
}

export const WordListForm: FC<WordListFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Word List',
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      wordsText: initialData?.words.join('\n') || '',
    },
  });

  const onFormSubmit = (data: FormData) => {
    // Parse words from textarea
    const words = data.wordsText
      .split('\n')
      .map(w => w.trim())
      .filter(Boolean);

    // Validate input
    const validation = validateWordListInput({
      name: data.name,
      description: data.description || undefined,
      words,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors.map(e => e.message));
      return;
    }

    setValidationErrors([]);
    onSubmit({
      name: data.name,
      description: data.description || undefined,
      words,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Word List' : 'Create New Word List'}</CardTitle>
          <CardDescription>
            {initialData
              ? 'Update your word list details below'
              : 'Add a name and words to create a new word list'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-error-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Name is required',
                maxLength: {
                  value: VALIDATION_LIMITS.MAX_LIST_NAME_LENGTH,
                  message: `Name cannot exceed ${VALIDATION_LIMITS.MAX_LIST_NAME_LENGTH} characters`,
                },
              })}
              placeholder="e.g., Week 1 Spelling Words"
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-error-500" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description', {
                maxLength: {
                  value: VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH,
                  message: `Description cannot exceed ${VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
                },
              })}
              placeholder="Add a brief description..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-error-500" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Words */}
          <div className="space-y-2">
            <Label htmlFor="wordsText">
              Words <span className="text-error-500">*</span>
            </Label>
            <Textarea
              id="wordsText"
              {...register('wordsText', {
                required: 'At least one word is required',
              })}
              placeholder="Enter one word per line"
              rows={10}
              className="font-mono"
            />
            <p className="text-sm text-gray-600">
              Enter one word per line. Maximum {VALIDATION_LIMITS.MAX_WORDS} words,{' '}
              {VALIDATION_LIMITS.MAX_WORD_LENGTH} characters each.
            </p>
            {errors.wordsText && (
              <p className="text-sm text-error-500" role="alert">
                {errors.wordsText.message}
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-md bg-error-50 border border-error-200 p-4">
              <h4 className="text-sm font-semibold text-error-800 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-error-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
