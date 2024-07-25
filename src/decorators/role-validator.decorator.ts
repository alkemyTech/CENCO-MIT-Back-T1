// this decorator verify if the input has one of the roles defined in the enum file
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsInEnum(enumObject: any, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isInEnum', //name of the decorator
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Object.values(enumObject).includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const enumValues = Object.values(enumObject).join(', ');
          return `${args.property} must be one of (${enumValues})`;
        },
      },
    });
  };
}
