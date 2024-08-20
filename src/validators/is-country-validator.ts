import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCountryValidConstraint implements ValidatorConstraintInterface {
  validate(country: string, args: ValidationArguments): boolean {
    const countryRegex = /^[a-zA-Zà-ÿÀ-ß' ]+$/;
    return countryRegex.test(country);
  }

  defaultMessage(args: ValidationArguments): string {
    return "The country name can only contain letters, spaces and apostrophes.";
  }
}

export function IsCountryValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCountryValidConstraint,
    });
  };
}
