import { useState, useCallback } from 'react';
import type { AnimalSex, ReproductionType, ReproductiveStatus, AnimalStatus } from '@/types';

interface AnimalFormData {
  name: string;
  id: string;
  breed: string;
  dateOfBirth: string;
  sex: AnimalSex;
  status: AnimalStatus;
  weightKg: string;
  heightCm: string;
  bodyCondition: string;
  location: string;
  fatherId: string;
  motherId: string;
  reproductionType: ReproductionType | undefined;
  reproductiveStatus: ReproductiveStatus | undefined;
}

interface ExistingAnimal {
  id: string;
  sex: AnimalSex;
}

type ValidationErrors = Partial<Record<keyof AnimalFormData, string>>;

export function useAnimalValidation(existingAnimals: ExistingAnimal[]) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AnimalFormData, boolean>>>({});

  const ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

  const validateField = useCallback(
    (field: keyof AnimalFormData, value: unknown, formData?: Partial<AnimalFormData>): string => {
      switch (field) {
        case 'id': {
          const val = String(value ?? '').trim();
          if (!val) return 'El ID es requerido';
          if (val.length < 2) return 'El ID debe tener al menos 2 caracteres';
          if (val.length > 20) return 'El ID no puede superar 20 caracteres';
          if (!ID_REGEX.test(val)) return 'El ID solo puede contener letras, números, guiones y guiones bajos';
          if (existingAnimals.some((a) => a.id === val)) return `Ya existe un animal con el ID "${val}"`;
          return '';
        }

        case 'name': {
          const val = String(value ?? '').trim();
          if (!val) return 'El nombre es requerido';
          if (val.length < 2) return 'El nombre debe tener al menos 2 caracteres';
          if (val.length > 50) return 'El nombre no puede superar 50 caracteres';
          return '';
        }

        case 'breed': {
          const val = String(value ?? '').trim();
          if (!val) return 'La raza es requerida';
          if (val.length < 2) return 'La raza debe tener al menos 2 caracteres';
          if (val.length > 50) return 'La raza no puede superar 50 caracteres';
          return '';
        }

        case 'dateOfBirth': {
          const val = String(value ?? '');
          if (!val) return ''; // opcional
          const date = new Date(val);
          if (isNaN(date.getTime())) return 'Fecha de nacimiento inválida';
          if (date > new Date()) return 'La fecha de nacimiento no puede ser en el futuro';
          if (date.getFullYear() < 1900) return 'La fecha no puede ser anterior al año 1900';
          return '';
        }

        case 'weightKg': {
          const val = String(value ?? '');
          if (!val) return ''; // opcional
          const num = Number(val);
          if (isNaN(num) || num <= 0) return 'El peso debe ser un número mayor a 0';
          if (num > 1000) return 'El peso no puede superar 1000 kg';
          return '';
        }

        case 'heightCm': {
          const val = String(value ?? '');
          if (!val) return ''; // opcional
          const num = Number(val);
          if (isNaN(num) || num <= 0) return 'La altura debe ser un número mayor a 0';
          if (num > 155) return 'La altura no puede superar 155 cm';
          return '';
        }

        case 'fatherId': {
          const val = String(value ?? '').trim();
          if (!val) return ''; // opcional
          const currentId = formData?.id?.trim();
          if (currentId && val === currentId) return 'El padre no puede ser el mismo animal';
          const father = existingAnimals.find((a) => a.id === val);
          if (!father) return `No existe ningún animal con el ID "${val}"`;
          if (father.sex !== 'male') return 'El animal indicado como padre debe ser macho';
          return '';
        }

        case 'motherId': {
          const val = String(value ?? '').trim();
          if (!val) return ''; // opcional
          const currentId = formData?.id?.trim();
          if (currentId && val === currentId) return 'La madre no puede ser el mismo animal';
          const mother = existingAnimals.find((a) => a.id === val);
          if (!mother) return `No existe ningún animal con el ID "${val}"`;
          if (mother.sex !== 'female') return 'El animal indicado como madre debe ser hembra';
          return '';
        }

        case 'reproductiveStatus': {
          const status = value as ReproductiveStatus | undefined;
          const sex = formData?.sex;
          if (status && sex === 'male') return 'El estado reproductivo solo aplica a hembras';
          return '';
        }

        case 'reproductionType': {
          const type = value as ReproductionType | undefined;
          const sex = formData?.sex;
          if (type && sex === 'male') return 'El tipo de reproducción solo aplica a hembras';
          return '';
        }

        default:
          return '';
      }
    },
    [existingAnimals]
  );

  const validateAll = useCallback(
    (formData: AnimalFormData): ValidationErrors => {
      const fields: (keyof AnimalFormData)[] = [
        'id', 'name', 'breed', 'dateOfBirth', 'weightKg',
        'heightCm', 'fatherId', 'motherId', 'reproductiveStatus',
      ];

      const newErrors: ValidationErrors = {};
      for (const field of fields) {
        const error = validateField(field, formData[field], formData);
        if (error) newErrors[field] = error;
      }

      setErrors(newErrors);
      // Mark all validated fields as touched
      const allTouched = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
      setTouched(allTouched);

      return newErrors;
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (field: keyof AnimalFormData, value: unknown, formData?: Partial<AnimalFormData>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, value, formData);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField]
  );

  const handleChange = useCallback(
    (field: keyof AnimalFormData, value: unknown, formData?: Partial<AnimalFormData>) => {
      // Only re-validate if the field was already touched
      setTouched((prev) => {
        if (prev[field]) {
          const error = validateField(field, value, formData);
          setErrors((e) => ({ ...e, [field]: error }));
        }
        return prev;
      });
    },
    [validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = Object.values(errors).some(Boolean);

  return {
    errors,
    touched,
    hasErrors,
    validateField,
    validateAll,
    handleBlur,
    handleChange,
    clearErrors,
  };
}