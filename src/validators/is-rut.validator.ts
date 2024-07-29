import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

function validateRut(rut: string): boolean {
  if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$/.test(rut)) {
    return false;
  }

  const [rutBody, dv] = rut.split('-');
  const cleanedRutBody = rutBody.replace(/\./g, '');

  return checkDv(cleanedRutBody, dv);
}

function checkDv(rutBody: string, dv: string): boolean {
  let total = 0;
  let factor = 2;

  for (let i = rutBody.length - 1; i >= 0; i--) {
    total += parseInt(rutBody[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const calculatedDv = 11 - (total % 11);
  if (calculatedDv === 11) {
    return dv === '0';
  } else if (calculatedDv === 10) {
    return dv.toUpperCase() === 'K';
  } else {
    return dv === calculatedDv.toString();
  }
}

@ValidatorConstraint({ async: false })
export class IsRutFormatConstraint implements ValidatorConstraintInterface {
  validate(rut: string, args: ValidationArguments) {
    return validateRut(rut);
  }

  defaultMessage(args: ValidationArguments) {
    return 'RUT ($value) is not in the correct format or is not valid';
  }
}

export function IsRutFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRutFormatConstraint,
    });
  };
}

