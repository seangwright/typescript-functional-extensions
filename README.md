# Typescript Functional Extensions

[![NPM](https://nodei.co/npm/typescript-functional-extensions.png)](https://nodei.co/npm/typescript-functional-extensions/)

A TypeScript implementation of the C# library [CSharpFunctionalExtensions](https://github.com/vkhorikov/CSharpFunctionalExtensions), including synchronous and asynchronous `Maybe` and `Result` monads.

## Community

### Related Projects

- [NestJS typescript-functional-extensions utilities](https://github.com/startupdevhouse/typescript-functional-extensions-nestjs) (A library of utilities for working with `typescript-functional-extensions` in [NestJS](https://nestjs.com/) projects)

### Influences

- [fp-ts](https://github.com/gcanti/fp-ts) (Typed functional programming in TypeScript)
- [CSharpFunctionalExtensions](https://github.com/vkhorikov/CSharpFunctionalExtensions) (A library to help write C# code in more functional way)

### Further Reading

- [Functional Extensions for C#](https://github.com/vkhorikov/CSharpFunctionalExtensions)
- [Functors, Applicatives, And Monads In Pictures](https://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Modeling Missing Data - The Maybe Monad](https://dev.to/seangwright/kentico-xperience-design-patterns-modeling-missing-data-the-maybe-monad-2c7i)
- [Handling Failures - The Result Monad](https://dev.to/seangwright/kentico-xperience-design-patterns-handling-failures-the-result-monad-1j25)

## How to Use

### npm

```bash
npm i typescript-functional-extensions
```

### Unpkg

> Supported since v1.4.0+

#### Full distributed source

<https://unpkg.com/browse/typescript-functional-extensions@3.0.0/>

#### ES Modules

<https://unpkg.com/typescript-functional-extensions@version/dist/esm/file>

Example:

<https://unpkg.com/typescript-functional-extensions@3.0.0/dist/esm/maybe.js>

```javascript
const { Maybe } = await import(
  'https://unpkg.com/typescript-functional-extensions@3.0.0/dist/esm/maybe.js'
);

const maybe = Maybe.some('test');
```

### Module Sizes

The distributed library is currently not minified. Below are the module sizes when minified (using UglifyJs) and GZipped:

- api.js: 0.15 kb
- index.js: 0.09 kb
- maybe.js: 0.82 kb
- maybe.utilities.js: 0.26 kb
- maybeAsync.js: 0.64 kb
- result.js: 1.32 kb
- resultAsync.js: 0.92 kb
- unit.js: 0.13 kb
- utilities.js: 0.27 kb

Total: 4.59 kb

### Core Monads

```typescript
import {
  Maybe,
  MaybeAsync,
  Result,
  ResultAsync,
} from 'typescript-functional-extensions';
```

### Utilities

```typescript
import {
  never,
  isDefined,
  isSome,
  isNone,
  isFunction,
  isPromise,
  noop,
} from 'typescript-functional-extensions';
```

```typescript
import {
  zeroAsNone,
  emptyStringAsNone,
  emptyOrWhiteSpaceStringAsNone,
} from 'typescript-functional-extensions';
```

```typescript
import {
  fetchResponse,
  fetchJsonResponse,
} from 'typescript-functional-extensions';
```

## Monads

Below are the monads included in this package and examples of their use.

More examples of all monads and their methods can be found in the library unit tests or in the dedicated documentation files for each type.

### Maybe

`Maybe` represents a value that might or might not exist. You can use it to declaratively describe a process (series of steps) without having to check if there is a value present.

```typescript
type Employee = {
  email: string;
  firstName: string;
  lastName: string;
  manager: Employee | undefined;
};

function yourBusinessProcess(): Employee[] {
  // ...
}

const employees = yourBusinessProcess();

Maybe.tryFirst(employees)
  .tap(({ firstName, lastName, email }) =>
    console.log(`Found Employee: ${firstName} ${lastName}, ${email}`))
  .bind(employee =>
    Maybe.from(employee.manager)
      .or({
        email: 'supervisor@business.com',
        firstName: 'Company',
        lastName: 'Supervisor',
        manager: undefined
      })
      .map(manager => ({ manager, employee }))
  )
  .match({
    some(attendees => scheduleMeeting(attendees.manager, attendees.employee)),
    none(() => console.log(`The business process did not return any employees`))
  });
```

1. `tryFirst` finds the first employee in the array and wraps it in a `Maybe`. If the array is empty, a `Maybe` with no value is returned.
1. `tap`'s callback is only called if an employee was found and logs out that employee's information.
1. `bind`'s callback is only called if an employee was found and converts the `Maybe` wrapping it into to another `Maybe`.
1. `from` wraps the employee's manager in a `Maybe`. If the employee has no manager, a `Maybe` with no value is returned.
1. `or` supplies a fallback in the case that the employee has no manager so that as long as an employee was originally found, all the following operations will execute.
1. `map` converts the manager to a new object which contains both the manager and employee.
1. `match` executes its `some` function if an employee was originally found and that employee has a manager. Since we supplied a fallback manager with `or`, the `some` function of `match` will execute if we found an employee. The `none` function of `match` executes if we didn't find any employees.

See more examples of `Maybe` [in the docs](./docs/maybe.md) or [in the tests](./test/maybe).

### MaybeAsync

`MaybeAsync` represents a future value (`Promise`) that might or might not exist.

`MaybeAsync` works just like `Maybe`, but since it is asynchronous, its methods accept a `Promise<T>` in most cases and all of its value accessing methods/getters return a `Promise<T>`.

See more examples of `MaybeAsync` [in the docs](./docs/maybeAsync.md) or [in the tests](./test/maybeAsync).

### Result

`Result` represents a successful or failed operation. You can use it to declaratively define a process without needing to check if previous steps succeeded or failed. It can replace processes that use throwing errors and `try`/`catch` to control the flow of the application, or processes where errors and data are returned from every function.

```typescript
type Employee = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  managerId: number | undefined;
};

function getEmployee(employeeId): Employee | undefined {
  const employee = getEmployee(employeeId);

  if (!employee) {
    throw Error(`Could not find employee ${employeeId}!`);
  }

  return employee;
}

Result.try(
  () => getEmployee(42),
  (error) => `Retrieving the employee failed: ${error}`
)
  .ensure(
    (employee) => employee.email.endsWith('@business.com'),
    ({ firstName, lastName }) =>
      `Employee ${firstName} ${lastName} is a contractor and not a full employee`
  )
  .bind(({ firstName, lastName, managerId }) =>
    Maybe.from(managerId).toResult(
      `Employee ${firstName} ${lastName} does not have a manager`
    )
  )
  .map((managerId) => ({
    managerId,
    employeeFullName: `${firstName} ${lastName}`,
  }))
  .bind(({ managerId, employeeFullName }) =>
    Result.try(
      () => getEmployee(managerId),
      (error) => `Retrieving the manager failed: ${error}`
    ).map((manager) => ({ manager, employeeFullName }))
  )
  .match({
    success: ({ manager: { email }, employeeFullName }) =>
      sendReminder(email, `Remember to say hello to ${employeeFullName}`),
    failure: (error) => sendSupervisorAlert(error),
  });
```

1. `try` executes the function to retrieve the employee, converting any thrown errors into a failed `Result` with the error message defined by the second parameter. If the employee is found, it returns a successful `Result`.
1. `ensure`'s callback is only called if an employee was successfully found. It checks if the employee works for the company by looking at their email address. If the address doesn't end in `@business.com`, a failed `Result` is returned with the error message defined in the second parameter. If the check passes, the original successful `Result` is returned.
1. `bind`'s callback is only called if the employee was found and works for the company. It converts the employee `Result` into another `Result`.
1. `toResult` converts a missing `managerId` into a failed `Result`. If there is a `managerId` value, it's converted into a successful `Result`.
1. `map`'s callback is only called if the `managerId` exists and converts the `managerId` into a new object to capture both the id and the employee's full name.
1. `bind`'s callback is only called if the original employee was found and that employee had a `managerId`. It converts the id and employee name into a new `Result`.
1. `try` now attempts to get the employee's manager and works the same as the first `try`.
1. `map`'s callback is only called if the original employee was found, has a `managerId` and that manager was also found. It converts the manager returned by `try` to a new object capturing both the manager and employee's name.
1. `match`'s `success` callback is only called if all the required information was retrieved and sends a reminder to the employee's manager. The `failure` callback is called if any of the required data could not be retrieved and sends an alert to the business supervisor with the error message.

See more examples of `Result` [in the docs](./docs/result.md) or [in the tests](./test/result).

### ResultAsync

`ResultAsync` represents a future result of an operation that either succeeds or fails.

`ResultAsync` works just like `Result`, but since it is asynchronous, its methods accept a `Promise<T>` in most cases and all of its value accessing methods/getters return a `Promise<T>`.

```typescript
function getLatestInventory(): Promise<{ apples: number }> {
  return Promise.reject('connection failure');
}

const resultAsync = ResultAsync.from(async () => {
  try {
    const value = await getLatestInventory();
    return Result.success(value);
  } catch (error: unknown) {
    return Result.failure(`Could not retrieve inventory: ${error}`);
  }
});

const result = await resultAsync.toPromise();

console.log(result.getErrorOrThrow()); // 'Could not retrieve inventory: connection failure'
```

See more examples of `ResultAsync` [in the docs](./docs/resultAsync.md) or [in the tests](./test/resultAsync).

## Contributing

To build this project, you must have v22.14.0 or higher of [Node.js](https://nodejs.org/en/download) installed.

If you've found a bug or have a feature request, please [open an issue](https://github.com/seangwright/typescript-functional-extensions/issues/new) on GitHub.

If you'd like to make a contribution, you can create a [Pull Request](https://github.com/seangwright/typescript-functional-extensions/compare) on GitHub.
