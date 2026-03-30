# Guía Completa de Testing Unitario en NestJS

## 📚 Índice

1. [¿Qué es Testing Unitario?](#qué-es-testing-unitario)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Tipos de Pruebas en NestJS](#tipos-de-pruebas-en-nestjs)
5. [Patrones de Testing](#patrones-de-testing)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Comandos y Herramientas](#comandos-y-herramientas)
8. [Buenas Prácticas](#buenas-prácticas)
9. [Casos Comunes en Entrevistas](#casos-comunes-en-entrevistas)

---

## ¿Qué es Testing Unitario?

### Definición
El **testing unitario** es el proceso de probar componentes individuales (unidades) de tu aplicación de forma aislada para verificar que funcionan correctamente.

### ¿Por qué es importante?

1. **Detectar bugs temprano**: Encuentra errores antes de que lleguen a producción
2. **Documentación viva**: Los tests muestran cómo se debe usar el código
3. **Refactorización segura**: Puedes cambiar código con confianza sabiendo que los tests lo validan
4. **Mejor diseño**: Escribir código testeable fuerza a tener componentes desacoplados
5. **Ahorro de tiempo**: Evita debugging manual repetitivo

### Jerarquía de Testing (Pyramid)

```
        ⬆️  E2E (Pocos, costosos)
    ⬆️  Integración (Medianos)
⬆️  Unitarios (Muchos, rápidos, baratos)
```

**Enfoque**: 70% pruebas unitarias, 20% integración, 10% E2E.

---

## Configuración del Proyecto

### Dependencias Instaladas

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.1.17",    // Utilidades de testing de NestJS
    "@types/jest": "^30.0.0",        // Tipos de Jest para TypeScript
    "@types/express": "^5.0.6",      // Tipos de Express
    "jest": "^30.3.0",               // Framework de testing
    "ts-jest": "^29.4.6",            // Transpila TypeScript para Jest
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "class-validator": "^0.14.4",    // Validación de DTOs
    "class-transformer": "^0.5.1",   // Transformación de objetos
    "@nestjs/swagger": "^11.2.6"    // Documentación API
  }
}
```

### Jest Config (`jest.config.js`)

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',      // Busca archivos .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',      // Usa ts-jest para TypeScript
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Alias de importación
  },
};
```

### Scripts en `package.json`

```json
{
  "scripts": {
    "test": "jest",                    // Ejecuta todos los tests
    "test:watch": "jest --watch",     // Modo watch (auto-ejecución)
    "test:cov": "jest --coverage"     // Reporte de cobertura
  }
}
```

---

## Estructura del Proyecto

```
src/
├── products/
│   ├── controllers/           # Manejan requests HTTP
│   │   ├── products.controller.ts
│   │   └── products.controller.spec.ts
│   ├── services/              # Lógica de negocio
│   │   ├── products.service.ts
│   │   └── products.service.spec.ts
│   ├── dto/                   # Data Transfer Objects
│   │   ├── create-product.dto.ts
│   │   ├── create-product.dto.spec.ts
│   │   ├── update-product.dto.ts
│   │   └── update-product.dto.spec.ts
│   ├── entities/              # Modelos/Entidades
│   │   └── product.entity.ts
│   ├── pipes/                 # Transforman parametros de entrada
│   │   ├── uppercase.pipe.ts
│   │   ├── uppercase.pipe.spec.ts
│   │   ├── parse-bool.pipe.ts
│   │   └── parse-bool.pipe.spec.ts
│   ├── guards/                # Controlan acceso (auth/roles)
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt-auth.guard.spec.ts
│   │   ├── roles.guard.ts
│   │   └── roles.guard.spec.ts
│   ├── filters/               # Manejo global de errores
│   │   ├── http-exception.filter.ts
│   │   └── http-exception.filter.spec.ts
│   ├── interceptors/          # Modifican request/response
│   │   ├── logging.interceptor.ts
│   │   ├── logging.interceptor.spec.ts
│   │   ├── transform.interceptor.ts
│   │   └── transform.interceptor.spec.ts
│   └── products.module.ts     # Módulo que agrupa todo
└── app.module.ts              # Módulo principal
```

**Convención**: Cada archivo `.ts` tiene su correspondiente `.spec.ts` con las pruebas.

---

## Tipos de Pruebas en NestJS

### 1. Testing de Servicios

**Objetivo**: Probar la lógica de negocio aisladamente, sin HTTP.

**Patrón típico**:
```typescript
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService], // Solo el servicio
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', () => {
    const result = service.create(validDto);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Product');
  });

  it('should throw NotFoundException for invalid id', () => {
    expect(() => service.findOne('999')).toThrow(
      NotFoundException
    );
  });
});
```

**Métodos comunes de Jest**:
- `expect(value).toBe(expected)` - igualdad estricta (===)
- `expect(value).toEqual(expected)` - igualdad profunda
- `expect(value).toHaveLength(n)` - longitud de array
- `expect(value).toBeTruthy()` / `toBeFalsy()`
- `expect(fn).toHaveBeenCalled()` - verificar llamada
- `expect(fn).toHaveBeenCalledWith(arg1, arg2)` - verificar argumentos
- `expect(value).toThrow(error)` - verificar excepción

### 2. Testing de Controladores

**Objetivo**: Probar que los endpoints HTTP responden correctamente.

**Estrategia**: Mock (simular) el servicio para aislar el controlador.

```typescript
describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: Partial<ProductsService>;

  beforeEach(async () => {
    // 1. Crear mock del servicio
    mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      // ... todos los métodos que usa el controlador
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should create a product', async () => {
    // Arrange - preparar datos
    const createDto: CreateProductDto = { /* ... */ };
    const mockProduct = { id: '1', name: 'Test' };

    mockProductsService.create = jest.fn()
      .mockReturnValue(mockProduct);

    // Act - ejecutar
    const result = await controller.create(createDto);

    // Assert - verificar
    expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockProduct);
  });
});
```

**Ventajas**:
- ✅ Rápido (no levanta servidor HTTP)
- ✅ Aislado (prueba solo el controlador)
- ✅ Control total sobre respuestas del servicio

### 3. Testing de DTOs (Validación)

**Objetivo**: Verificar que los datos de entrada son válidos.

**Patrón**:
```typescript
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateProductDto', () => {
  it('should validate a valid DTO', async () => {
    // IMPORTANTE: usar plainToInstance para decoradores
    const dto = plainToInstance(CreateProductDto, {
      name: 'Product',
      price: 100,
      category: 'ELECTRONICS',
      inStock: true,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0); // Sin errores
  });

  it('should reject negative price', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Product',
      price: -10, // ❌ Inválido
      category: 'ELECTRONICS',
      inStock: true,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'price')).toBe(true);
  });
});
```

**Decoradores常用**:
- `@IsString()` - debe ser string
- `@IsNumber()` - debe ser número
- `@IsBoolean()` - debe ser booleano
- `@IsEnum(Enum)` - debe ser valor del enum
- `@Min(0)` - mínimo valor
- `@MaxLength(100)` - longitud máxima
- `@IsOptional()` - campo opcional
- `@IsNotEmpty()` - string no vacío

### 4. Testing de Pipes

**Objetivo**: Probar transformación/validación de parámetros.

**Ejemplo: UppercasePipe**
```typescript
@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: string) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Expected a string');
    }
    return value.toUpperCase();
  }
}

// Test
describe('UppercasePipe', () => {
  let pipe: UppercasePipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UppercasePipe],
    }).compile();

    pipe = module.get<UppercasePipe>(UppercasePipe);
  });

  it('transform should convert to uppercase', () => {
    expect(pipe.transform('hello')).toBe('HELLO');
  });

  it('should throw for non-string', () => {
    expect(() => pipe.transform(123 as any))
      .toThrow(BadRequestException);
  });
});
```

### 5. Testing de Guards

**Objetivo**: Probar lógica de autorización/autenticación.

**JWT Auth Guard**:
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (token !== 'valid-token') {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { id: 1, username: 'testuser' };
    return true;
  }
}

// Test
describe('JwtAuthGuard', () => {
  it('should throw UnauthorizedException if no token', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    expect(() => guard.canActivate(mockContext as any))
      .toThrow(UnauthorizedException);
  });

  it('should attach user and return true for valid token', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer valid-token' },
      user: undefined,
    };

    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    };

    const result = guard.canActivate(mockContext as any);
    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 1, username: 'testuser' });
  });
});
```

**Roles Guard (con Reflector)**:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // Sin restricción

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) throw new ForbiddenException();
    const hasRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRole) throw new ForbiddenException();
    return true;
  }
}

// Test (mocking Reflector)
const mockReflector = {
  get: jest.fn(),
};

const guard = new RolesGuard(mockReflector);

// Simular que el método está protegido con @Roles('admin')
mockReflector.get.mockReturnValue(['admin']);

const mockContext = {
  switchToHttp: () => ({
    getRequest: () => ({ user: { roles: ['admin'] } }),
  }),
  getHandler: () => ({}),
};

expect(guard.canActivate(mockContext)).toBe(true);
```

### 6. Testing de Filters

**Objetivo**: Probar manejo global de excepciones.

**HTTP Exception Filter**:
```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Test
describe('HttpExceptionFilter', () => {
  it('should format HttpException correctly', () => {
    const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: '/test' };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Error',
        path: '/test',
        timestamp: expect.any(String),
      })
    );
  });
});
```

### 7. Testing de Interceptors

**Objetivo**: Probar transformación de request/response.

**Logging Interceptor**:
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}

// Test
describe('LoggingInterceptor', () => {
  it('should log request method, URL, and response time', () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(
        new Observable(subscriber => {
          subscriber.next('response');
          subscriber.complete();
        })
      ),
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/products' }),
      }),
    };

    interceptor.intercept(mockContext as any, mockCallHandler)
      .subscribe(() => {
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.stringMatching(/^GET \/products - \d+ms$/)
        );
      });
  });
});
```

**Transform Interceptor** (wrapping response):
```typescript
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(context: ExecutionContext, next: CallHandler):
    Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        status: 'success',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

---

## Patrones de Testing

### Arrange-Act-Assert (AAA)

**Estructura de cada test**:

```typescript
it('should create a product', async () => {
  // ARRANGE - Preparar datos y mocks
  const createDto: CreateProductDto = {
    name: 'Test Product',
    price: 100,
    category: ProductCategory.ELECTRONICS,
    inStock: true,
    stockQuantity: 10,
  };

  const expectedProduct = {
    id: '1',
    ...createDto,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ACT - Ejecutar la función
  const result = service.create(createDto);

  // ASSERT - Verificar resultado
  expect(result).toHaveProperty('id');
  expect(result.name).toBe(createDto.name);
  expect(result.price).toBe(createDto.price);
  expect(result).toEqual(expect.objectContaining({
    id: expect.any(String),
    createdAt: expect.any(Date),
  }));
});
```

### Setup y Teardown

```typescript
let service: ProductsService;
let mockDependency: Partial<SomeDependency>;

beforeEach(async () => {
  // Se ejecuta ANTES de cada test
  mockDependency = { method: jest.fn() };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProductsService,
      { provide: 'DEPENDENCY_TOKEN', useValue: mockDependency },
    ],
  }).compile();

  service = module.get<ProductsService>(ProductsService);
  jest.clearAllMocks(); // Limpiar mocks
});

afterEach(async () => {
  // Se ejecuta DESPUÉS de cada test
  await module.close(); // Liberar recursos
});

beforeAll(async () => {
  // Una sola vez antes de TODOS los tests
});

afterAll(async () => {
  // Una sola vez después de TODOS los tests
});
```

### Mocking (Simulación)

**¿Qué es?**: Reemplazar dependencias reales por versiones fake controladas.

**Mock con Jest**:
```typescript
const mockService = {
  create: jest.fn(),           // Mock function
  findAll: jest.fn().mockReturnValue([]), // Mock con valor de retorno
  findOne: jest.fn().mockRejectedValue(
    new NotFoundException('Not found')
  ), // Mock que lanza error
};

// Usar el mock
mockService.create.mockReturnValue(mockedData);
mockService.create.mockImplementation((dto) => {
  // Lógica personalizada del mock
  return { id: '1', ...dto };
});

// Verificar llamadas
expect(mockService.create).toHaveBeenCalledTimes(1);
expect(mockService.create).toHaveBeenCalledWith(expectedDto);
expect(mockService.create).toHaveBeenCalledBefore(mockService.findAll);
```

**Mock con `jest.spyOn`** (para métodos de objetos reales):
```typescript
const realService = new ProductsService();
const spy = jest.spyOn(realService, 'findAll');

realService.findAll();
expect(spy).toHaveBeenCalled();
```

### Testing de Errores

```typescript
it('should throw BadRequestException for invalid price', () => {
  const invalidDto = { price: -1, /* ... */ };

  expect(() => service.create(invalidDto))
    .toThrow(BadRequestException);

  // Verificar mensaje específico
  expect(() => service.create(invalidDto))
    .toThrow('Price must be greater than zero');
});

// Para errores asíncronos
it('should throw error async', async () => {
  await expect(service.delete('999'))
    .rejects.toThrow(NotFoundException);
});
```

### Testing de Valores Dinámicos

```typescript
// Verificar que existe una propiedad sin importar su valor
expect(result).toHaveProperty('id');
expect(result).toHaveProperty('createdAt');

// Verificar tipo de dato
expect(typeof result.id).toBe('string');
expect(result.createdAt).toBeInstanceOf(Date);

// Verificar que contiene some propiedades
expect(result).toEqual(expect.objectContaining({
  name: 'Test',
  price: 100,
}));

// Verificar que NO contiene algunas
expect(result).not.toEqual(expect.objectContaining({
  password: expect.any(String),
}));
```

---

## Ejemplos Prácticos

### Ejemplo 1: Service Completo

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    return passwordValid ? user : null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: await this.jwtService.sign(payload),
      user: { id: user.id, email: user.email },
    };
  }
}

// Test
describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockResolvedValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should validate user with correct credentials', async () => {
    const user = { id: 1, email: 'test@test.com', password: 'hashed' };
    mockUsersService.findByEmail = jest.fn().mockResolvedValue(user);

    const result = await service.validateUser('test@test.com', 'password123');

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@test.com');
    expect(result).toEqual(user);
  });

  it('should return null for invalid credentials', async () => {
    mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);

    const result = await service.validateUser('wrong@test.com', 'pass');

    expect(result).toBeNull();
  });

  it('should generate JWT token on login', async () => {
    const user = { id: 1, email: 'test@test.com' };

    const result = await service.login(user);

    expect(mockJwtService.sign).toHaveBeenCalledWith({
      email: 'test@test.com',
      sub: 1,
    });
    expect(result).toEqual({
      access_token: 'fake-jwt-token',
      user: { id: 1, email: 'test@test.com' },
    });
  });
});
```

### Ejemplo 2: Testing con Base de Datos Mock

```typescript
// En lugar de conectar a DB real, mockear repositorio
describe('ProductsService with Repository', () => {
  let service: ProductsService;
  let mockRepository: Partial<Repository<Product>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
       ProductsService,
        { provide: 'PRODUCT_REPOSITORY', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should find all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ];
    mockRepository.find = jest.fn().mockResolvedValue(mockProducts);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });
});
```

---

## Comandos y Herramientas

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Modo watch (auto-repetir al guardar archivos)
npm run test:watch

# Con cobertura
npm run test:cov

# Tests específicos
npm test -- products.service.spec.ts
npm test -- -t "should create a product"  # Por nombre de test

# Tests que coinciden con patrón
npm test -- products/
```

### Reportes

```bash
# Coverage
npm run test:cov
# Genera: coverage/ directory con index.html

# Ver coverage en navegador
open coverage/lcov-report/index.html
```

### Debugging Tests

```typescript
// 1. Agregar console.log
it('should debug', () => {
  console.log('Debug:', variable);
  expect(result).toBe(expected);
});

// 2. Usar debugger
it('should debug', () => {
  debugger; // Pausa ejecución
  expect(result).toBe(expected);
});
// Ejecutar: node --inspect-brk node_modules/.bin/jest

// 3. Solo correr un test específico
describe.only('ProductsService', () => { ... });
it.only('should create', () => { ... });
```

### Helpers de Jest

```javascript
// jest.setup.js (configurar en jest.config.js)
global.console = {
  ...console,
  // Mock global de console
  log: jest.fn(),
};

// beforeAll/afterAll globales
beforeAll(() => {
  // Conexión a DB de test
});

afterAll(async () => {
  // Cerrar conexiones
});
```

---

## Buenas Prácticas

### ✅ Hacer

1. **Tests independientes**: Cada test debe poder ejecutarse solo, sin depender del estado de otros tests.
2. **Arrange-Act-Assert**: Estructura clara en cada test.
3. **Nombres descriptivos**:

```typescript
// ❌ Mal
it('should work', () => {});
it('test 1', () => {});

// ✅ Bien
it('should throw NotFoundException when product id does not exist', () => {});
it('should return all products sorted by name', () => {});
```

4. **Un assert por test** (generalmente):

```typescript
// ✅ Mejor
it('should create product with correct name', () => {
  expect(result.name).toBe('Test');
});
it('should create product with correct price', () => {
  expect(result.price).toBe(100);
});

// O usar .toEqual para múltiples asserts
it('should create product with all fields', () => {
  expect(result).toEqual({
    id: expect.any(String),
    name: 'Test',
    price: 100,
    // ...
  });
});
```

5. **Tests rápidos**: Unit tests deben ejecutarse en milisegundos.
6. **Mock externos**: DB, APIs externas, servicios de pago.
7. **Usar factories para datos**:

```typescript
const productFactory = (overrides = {}) => ({
  id: '1',
  name: 'Product',
  price: 100,
  category: 'ELECTRONICS',
  inStock: true,
  ...overrides,
});

// Usar
const product = productFactory({ name: 'Special' });
```

8. **Cobertura > 80%**: Al menosServices y lógica crítica al 100%.

### ❌ No Hacer

1. **No testear implementación**: Testear comportamiento, no cómo está implementado internamente.

```typescript
// ❌ Mal (acoplado a implementación)
it('should call private method', () => {
  const spy = jest.spyOn(service, 'validatePrice');
  service.create(dto);
  expect(spy).toHaveBeenCalled(); // Rompe si refactorizas
});

// ✅ Bien (testear resultado)
it('should throw error for negative price', () => {
  expect(() => service.create({ price: -1 }))
    .toThrow('Price must be positive');
});
```

2. **No usar datos reales en DB**: Usar in-memory (como hacemos) o mocks.
3. **No tener tests frágiles**: Tests que fallan por cambios no-relacionados.
4. **No testear librerías de terceros**: Asume que `class-validator`, `bcrypt` ya funcionan.
5. **No hacer过度 mocking**: No mockear todo, testear integración cuando sea apropiado.

---

## Casos Comunes en Entrevistas

### 1. Crear un Servicio y Testear Todas las Ramas

```typescript
// Función con múltiples paths
function processOrder(order: Order): OrderResult {
  if (!order.items.length) {
    throw new Error('Empty order');
  }
  if (order.total <= 0) {
    throw new Error('Invalid total');
  }
  if (order.items.length > 10) {
    return { status: 'bulk', discount: 0.1 };
  }
  return { status: 'normal', discount: 0 };
}

// Tests: 1 por cada return/throw
describe('processOrder', () => {
  it('should throw for empty order', () => {
    expect(() => processOrder({ items: [] }))
      .toThrow('Empty order');
  });
  it('should throw for invalid total', () => {
    expect(() => processOrder({ items: [...], total: -1 }))
      .toThrow('Invalid total');
  });
  it('should apply bulk discount for 10+ items', () => {
    const order = { items: Array(11).fill({}), total: 100 };
    expect(processOrder(order)).toEqual({
      status: 'bulk',
      discount: 0.1,
    });
  });
  it('should return normal for < 10 items', () => {
    const order = { items: Array(5).fill({}), total: 100 };
    expect(processOrder(order)).toEqual({
      status: 'normal',
      discount: 0,
    });
  });
});
```

### 2. Mock de Fetch/HTTP

```typescript
import * as http from 'http';

// Mock global
global.http = {
  get: jest.fn(),
};

it('should fetch data from API', async () => {
  (http.get as jest.Mock).mockImplementation((url, cb) => {
    cb({ statusCode: 200 }, JSON.stringify({ data: 'test' }));
  });

  await service.fetchData();

  expect(http.get).toHaveBeenCalledWith(
    'https://api.example.com/data',
    expect.any(Function)
  );
});
```

### 3. Test Asíncrono (async/await)

```typescript
// Función asíncrona
async function getUser(id: string): Promise<User> {
  const user = await db.users.findOne(id);
  if (!user) throw new NotFoundException();
  return user;
}

// Test
it('should return user', async () => {
  const mockUser = { id: '1', name: 'John' };
  db.users.findOne = jest.fn().mockResolvedValue(mockUser);

  const result = await getUser('1');

  expect(result).toEqual(mockUser);
});

it('should throw when user not found', async () => {
  db.users.findOne = jest.fn().mockResolvedValue(null);

  await expect(getUser('999'))
    .rejects.toThrow(NotFoundException);
});
```

### 4. Test con Callbacks

```typescript
function processData(data: string, callback: (err: Error | null, result?: string) => void) {
  if (!data) callback(new Error('No data'));
  else callback(null, data.toUpperCase());
}

// Test
it('should process data and call callback', (done) => {
  processData('hello', (err, result) => {
    expect(err).toBeNull();
    expect(result).toBe('HELLO');
    done(); // Importante: indicar que test terminó
  });
});
```

---

## Teoría Avanzada

### Matchers de Jest

```typescript
// Strings
expect('hello').toMatch(/ello/);
expect('hello').toContain('ell');

// Numbers
expect(10).toBeGreaterThan(5);
expect(10).toBeLessThanOrEqual(10);
expect(0.1 + 0.2).toBeCloseTo(0.3); // Para floats

// Arrays
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });
expect({ a: 1 }).toStrictEqual({ a: 1 }); // tipo y valor

// Null/Undefined
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('test').toBeDefined();

// Excepciones
expect(() => {
  throw new Error('error');
}).toThrow('error');
expect(() => fn()).toThrowError(Error);
```

### Snapshot Testing

```typescript
// Guarda versión "ideal" del output y compara en futuros runs
it('should match snapshot', () => {
  const component = { name: 'Test', props: { color: 'red' } };
  expect(component).toMatchSnapshot();
});

// Para objetos grandes o reactivos
expect(JSON.stringify(data)).toMatchSnapshot();
```

### Grupos de Tests

```typescript
describe('ProductsService', () => {
  // Se ejecuta antes de este bloque
  describe('CRUD Operations', () => {
    it('create', () => {});
    it('findOne', () => {});
  });

  describe('Business Logic', () => {
    it('getTotalValue', () => {});
    it('getAvailableProducts', () => {});
  });

  describe('Edge Cases', () => {
    it('empty inventory', () => {});
  });
});
```

### Test Paralelo

```bash
# Jest corre tests en paralelo por defecto
# Controlar con:
--runInBand  # Secuencial
--maxWorkers=2  # Máximo 2 workers
```

---

## Ejercicios Prácticos

### Nivel 1 (Básico)
1. Crea un `CalculatorService` con operaciones suma, resta, multiplica, divide.
2. Testea todos los métodos, incluyendo división por cero.
3. Crea un `UserService` con registro y login, testea validaciones.

### Nivel 2 (Intermedio)
1. Crea un `OrderService` que calcule total con impuestos y descuentos.
2. Testea diferentes tasas de impuesto según país.
3. Crea un Pipe que valide fechas futuras.
4. Crea un Guard que permita acceso solo a usuarios con email verificado.

### Nivel 3 (Avanzado)
1. Crea integración: Controller → Service → Repository (in-memory).
2. Usa TestingModule completo.
3. Mockea errores de DB (timeout, connection lost).
4. Implementa y testea un Interceptor de cache.
5. Testea logs de Auditoría.

---

## Depuración de Tests

### Problemas Comunes

**1. "Cannot find module"**
```typescript
// Asegurar tsconfig tiene:
{
  "compilerOptions": {
    "module": "commonjs",  // Para Jest
    "esModuleInterop": true,
  }
}
```

**2. Mock functions no disponibles**
```typescript
// TypeScript requiere tipos para mocks:
const mockService = {
  method: jest.fn() as jest.MockedFunction<typeof realMethod>,
};

// O usar: const mockService = {} as Partial<Service>;
```

**3. Async tests timeutean**
```typescript
// Devolver promise o usar async/await
it('async test', async () => {
  await expect(service.asyncMethod()).resolves.toBe(value);
});

// O retornar promise
it('async test', () => {
  return service.asyncMethod().then(result => {
    expect(result).toBe(value);
  });
});
```

**4. Mock implementation pierde tipo**
```typescript
// Especificar retorno tambien:
mockService.method = jest.fn().mockResolvedValue(mockData);

// Para void:
const mockFn = jest.fn();
mockFn.mockImplementation(() => {});
```

---

## Referencias

### Documentación Oficial
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Class Validator](https://class-validator.js.org/)

### Patrones
- **Testing Trophy**: Unit > Integration > E2E
- **AAA**: Arrange, Act, Assert
- **Given-When-Then**: Gherkin-style naming
- **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely

### Herramientas Adicionales
- `@nestjs/testing`: Nativas de Nest
- `supertest`: Para E2E de HTTP
- `testcontainers`: Tests con DB real en Docker
- `jest-mock-extended`: Mocks tipados fáciles
- `faker.js`: Datos fake realistas

---

## Checklist Pre-Push

- [ ] Todos los tests pasan (`npm test`)
- [ ] Coverage > 80% (`npm run test:cov`)
- [ ] No hay `console.log` left
- [ ] Mocks limpios con `jest.clearAllMocks()`
- [ ] Tests nombrados claramente
- [ ] Cobertura de casos de error
- [ ] Tests asíncronos correctamente manejados

---

## Conclusión

El testing unitario en NestJS sigue estas reglas de oro:

1. **Aísla lo que pruebas**: Mock dependencias externas
2. **Sigue AAA**: Arrange, Act, Assert
3. **Nombre claro**: Describe qué, cómo, por qué
4. **Tests rápidos y deterministas**: Sin random, fechas hardcodeadas
5. **Cobertura calidad > cantidad**: 100% de lógica crítica vs 50% trivial

**Práctica**: Empieza escribiendo tests para código nuevo, luego gradualmente para código existente. Usa TDD (Test-Driven Development) si te sientes cómodo: escribir test → fallar → implementar → pasar → refactor.

---

🚀 **Recuerda**: Tests no son un costo, son una inversión que paga dividends en confianza, mantenibilidad y calidad de código.
