# NestJS Testing Practice

A comprehensive NestJS project demonstrating unit testing best practices for professional development.

## Description

This project showcases unit testing patterns for all common NestJS components:
- Services
- Controllers
- DTOs (with class-validator)
- Pipes (custom and built-in)
- Guards (authentication and authorization)
- Filters (HTTP exception handling)
- Interceptors (logging and transformation)

The example application is a simple Product Management API using an in-memory store.

## Project Structure

```
src/
├── common/
│   └── decorators/
│       └── roles.decorator.ts
├── products/
│   ├── controllers/
│   │   ├── products.controller.ts
│   │   └── products.controller.spec.ts
│   ├── services/
│   │   ├── products.service.ts
│   │   └── products.service.spec.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── create-product.dto.spec.ts
│   │   ├── update-product.dto.ts
│   │   └── update-product.dto.spec.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── pipes/
│   │   ├── uppercase.pipe.ts
│   │   ├── uppercase.pipe.spec.ts
│   │   ├── parse-bool.pipe.ts
│   │   └── parse-bool.pipe.spec.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt-auth.guard.spec.ts
│   │   ├── roles.guard.ts
│   │   └── roles.guard.spec.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── http-exception.filter.spec.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── logging.interceptor.spec.ts
│   │   ├── transform.interceptor.ts
│   │   └── transform.interceptor.spec.ts
│   ├── products.module.ts
└── app.module.ts
```

## Installation

```bash
npm install
```

## Running the application

```bash
# development
npm run start:dev

# production
npm run start:prod
```

## Testing

This project uses Jest for unit testing.

```bash
# run all tests
npm test

# run tests in watch mode
npm run test:watch

# generate test coverage report
npm run test:cov
```

## Testing Examples Covered

### Service Testing
- CRUD operations
- Business logic validation
- Error handling (NotFoundException, BadRequestException)
- Edge cases and empty states

### Controller Testing
- Mocking dependencies
- Testing all endpoints
- Request/response validation
- HTTP status codes

### DTO Validation Testing
- Required fields
- String validation (length, format)
- Number validation (min, positive)
- Enum validation
- Partial updates

### Pipe Testing
- Custom transformation pipes (UppercasePipe)
- Parsing pipes (ParseBoolPipe)
- Input validation

### Guard Testing
- JWT authentication simulation
- Role-based authorization
- Metadata reflection

### Filter Testing
- Global exception handling
- Custom error responses
- Different HTTP status codes

### Interceptor Testing
- Request/response logging
- Response transformation
- Timing measurements

## Key Testing Techniques

- **Mocking**: Using Jest mocks for dependencies
- **TestingModule**: NestJS testing utilities
- **Integration**: Testing the full request pipeline
- **Edge Cases**: Testing error scenarios
- **Isolation**: Unit tests vs. e2e tests

## Technology Stack

- NestJS 11
- TypeScript 5.9
- Jest 30
- class-validator
- class-transformer
- @nestjs/swagger

## Author

ReZherk

## License

ISC
