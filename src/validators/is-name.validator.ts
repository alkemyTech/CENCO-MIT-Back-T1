import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsNameValidConstraint implements ValidatorConstraintInterface {
  validate(name: string, args: ValidationArguments): boolean {
    const nameRegex = /^[a-zA-Zà-ÿÀ-ß' ]+$/;
    return nameRegex.test(name);
  }

  defaultMessage(args: ValidationArguments): string {
    return "The name can only contain letters, spaces and apostrophes.";
  }
}

export function IsNameValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNameValidConstraint,
    });
  };
}
