import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsPhoneValidConstraint implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments): boolean {
    const phoneRegex = /^\+\d{11,12}$/;
    return phoneRegex.test(phone);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'The phone number must be valid and follow the format: +56912345XXX';
  }
}

export function IsPhoneValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneValidConstraint,
    });
  };
}
