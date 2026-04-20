# Guía de Integración de Pagos - Stripe & PayPal

## Estructura del Proyecto

```
cerrajeria-abp/
├── cerrajeria-back/     # Laravel API Backend
└── cerrajeria-front/    # React Frontend (directorio actual)
```

---

## STRIPE INTEGRATION

### Backend Laravel (cerrajeria-back)

#### 1. Instalar SDK
```bash
cd ../cerrajeria-back
composer require stripe/stripe-php
```

#### 2. Configurar Variables de Entorno (.env)
```env
# Stripe Keys (obtenidas desde stripe.com/dashboard)
STRIPE_KEY=REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET=REPLACE_WITH_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_YOUR_WEBHOOK_SECRET

# Opcional: Configuración de webhook
STRIPE_WEBHOOK_ENDPOINT_SECRET=${STRIPE_WEBHOOK_SECRET}
```

#### 3. Archivo de Configuración (config/services.php)
Agregar:
```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],
```

#### 4. Crear Controlador de Pagos
**app/Http/Controllers/PaymentController.php**
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\StripeException;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Crear PaymentIntent para procesar pago
     */
    public function createIntent(Request $request)
    {
        try {
            // Validación básica
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'metadata' => 'nullable|array'
            ]);

            // Configurar Stripe
            Stripe::setApiKey(config('services.stripe.secret'));

            // Crear PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => (int)($request->amount * 100), // Stripe usa centavos
                'currency' => strtolower($request->currency),
                'payment_method_types' => ['card'],
                'metadata' => $request->metadata ?? [],
                'description' => $request->description ?? 'Pago en Cerrajería ABP',
                'capture_method' => 'automatic', // O 'manual' para capturar después
            ]);

            return response()->json([
                'success' => true,
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id
            ], 200);

        } catch (StripeException $e) {
            Log::error('Stripe Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Confirmar pago (opcional si usas capture_method manual)
     */
    public function confirmPayment($paymentIntentId)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            
            if ($paymentIntent->status === 'succeeded') {
                // Aquí puedes marcar la orden como pagada en tu BD
                // Order::where('stripe_id', $paymentIntentId)->update(['paid' => true]);
                
                return response()->json([
                    'success' => true,
                    'status' => $paymentIntent->status
                ]);
            }

            return response()->json([
                'success' => false,
                'status' => $paymentIntent->status
            ], 400);

        } catch (StripeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook para eventos de Stripe
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );

            // Manejar diferentes tipos de evento
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;
                    // Marcar orden como pagada
                    // Order::where('stripe_id', $paymentIntent->id)->update(['paid' => true]);
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    // Registrar fallo
                    break;

                case 'charge.refunded':
                    // Manejar reembolsos
                    break;
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
```

#### 5. Registrar Rutas API
**routes/api.php**
```php
use App\Http\Controllers\PaymentController;

Route::middleware('api')->group(function () {
    // Crear intento de pago
    Route::post('/payment/create-intent', [PaymentController::class, 'createIntent']);
    
    // Confirmar pago (opcional)
    Route::post('/payment/confirm/{paymentIntentId}', [PaymentController::class, 'confirmPayment']);
    
    // Webhook de Stripe (IMPORTANTE: Sin autenticación)
    Route::post('/payment/webhook', [PaymentController::class, 'handleWebhook']);
});
```

#### 6. Configurar CORS
**config/cors.php** - Asegurar que el frontend React pueda acceder:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

---

### Frontend React (cerrajeria-front)

#### 1. Instalar Dependencias
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 2. Estructura de Componentes Sugerida
```
src/
├── components/
│   ├── CheckoutForm.jsx      # Formulario de pago
│   ├── PaymentElements.jsx   # Elementos de Stripe
│   └── PaymentSuccess.jsx    # Vista de éxito
├── pages/
│   └── Checkout.jsx          # Página de checkout
└── services/
    └── stripeService.js       # Servicio para llamadas API
```

#### 3. Servicio de Stripe
**src/services/stripeService.js**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const createPaymentIntent = async (amount, currency = 'eur', metadata = {}) => {
    try {
        const response = await axios.post(`${API_URL}/api/payment/create-intent`, {
            amount,
            currency,
            metadata
        });
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

export const confirmPayment = async (paymentIntentId) => {
    try {
        const response = await axios.post(`${API_URL}/api/payment/confirm/${paymentIntentId}`);
        return response.data;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};
```

#### 4. Componente CheckoutForm
**src/components/CheckoutForm.jsx**
```jsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

const CheckoutForm = ({ clientSecret, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    // Aquí puedes recoger datos del usuario
                    name: 'Cliente',
                }
            }
        });

        if (error) {
            setErrorMessage(error.message);
            if (onError) onError(error);
        } else if (paymentIntent.status === 'succeeded') {
            if (onSuccess) onSuccess(paymentIntent);
        }

        setLoading(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Tarjeta de crédito
                </label>
                <div className="p-3 border rounded-md">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? 'Procesando...' : `Pagar €${(amount / 100).toFixed(2)}`}
            </button>
        </form>
    );
};

export default CheckoutForm;
```

#### 5. Página de Checkout
**src/pages/Checkout.jsx**
```jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { createPaymentIntent } from '../services/stripeService';
import axios from 'axios';

// Cargar Stripe con tu publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY...');

const Checkout = ({ amount, onSuccess, onError }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializePayment = async () => {
            try {
                const response = await createPaymentIntent(amount);
                if (response.success) {
                    setClientSecret(response.clientSecret);
                } else {
                    setError(response.error);
                }
            } catch (err) {
                setError('Error al inicializar pago');
            } finally {
                setLoading(false);
            }
        };

        initializePayment();
    }, [amount]);

    const handleSuccess = (paymentIntent) => {
        // Opcional: Confirmar en backend
        // confirmPayment(paymentIntent.id);
        if (onSuccess) onSuccess(paymentIntent);
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Proceso de Pago</h2>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                    clientSecret={clientSecret}
                    amount={amount}
                    onSuccess={handleSuccess}
                    onError={onError}
                />
            </Elements>

            <div className="mt-4 text-sm text-gray-600">
                <p>Los pagos están procesados por Stripe de forma segura.</p>
            </div>
        </div>
    );
};

export default Checkout;
```

#### 6. Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_KEY=REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY
```

---

### Variables del Proyecto

#### Backend Laravel:
- `.env` en `cerrajeria-back/`
- Agregar: `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`

#### Frontend React:
- `.env` en `cerrajeria-front/`
- Agregar: `VITE_STRIPE_KEY`, `VITE_API_URL`

---

### Testing con Stripe

#### Tarjetas de Prueba (Modo Test)
- **Visa:** `4242 4242 4242 4242`
- **Mastercard:** `5555 5555 5555 4444`
- **Amex:** `3782 822463 10005`
- Cualquier fecha futura (MM/AA), cualquier CVC (3-4 dígitos)

#### Webhook Local
Usar `stripe-cli` para probar webhooks:
```bash
stripe listen --forward-to localhost:8000/api/payment/webhook
```

---

## PAYPAL INTEGRATION

### Backend Laravel (cerrajeria-back)

#### 1. Instalar SDK de PayPal
```bash
composer require paypal/paypal-checkout-sdk
```

#### 2. Variables de Entorno (.env)
```env
PAYPAL_CLIENT_ID=REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID... (sandbox)
PAYPAL_CLIENT_SECRET=REPLACE_WITH_YOUR_PAYPAL_SECRET... (sandbox)
PAYPAL_MODE=sandbox  # o 'live' para producción
```

#### 3. Configuración (config/paypal.php)
```php
<?php

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'),
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    'settings' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'),
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
        'log' => [
            'log_enabled' => true,
            'file' => storage_path('logs/paypal.log'),
        ],
    ],
];
```

#### 4. Controlador PayPal
**app/Http/Controllers/PayPalController.php**
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use Illuminate\Support\Facades\Log;

class PayPalController extends Controller
{
    private $client;

    public function __construct()
    {
        $environment = config('paypal.mode') === 'live'
            ? new ProductionEnvironment(
                config('paypal.settings.client_id'),
                config('paypal.settings.client_secret')
            )
            : new SandboxEnvironment(
                config('paypal.settings.client_id'),
                config('paypal.settings.client_secret')
            );

        $this->client = new PayPalHttpClient($environment);
    }

    /**
     * Crear orden de PayPal
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'items' => 'nullable|array'
        ]);

        $orderRequest = new OrdersCreateRequest();
        $orderRequest->prefer('return=representation');
        $orderRequest->body = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => strtoupper($request->currency),
                    'value' => number_format($request->amount, 2, '.', ''),
                ],
                'description' => 'Pedido en Cerrajería ABP',
            ]],
            'application_context' => [
                'cancel_url' => route('paypal.cancel'),
                'return_url' => route('paypal.success'),
                'brand_name' => 'Cerrajería ABP',
                'landing_page' => 'BILLING',
                'user_action' => 'PAY_NOW',
                'shipping_preference' => 'NO_SHIPPING'
            ]
        ];

        try {
            $response = $this->client->execute($orderRequest);
            
            // Guardar order ID en sesión o BD
            // session(['paypal_order_id' => $response->result->id]);

            return response()->json([
                'success' => true,
                'orderID' => $response->result->id,
                'approvalUrl' => $this->getApprovalUrl($response->result->links)
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal Create Order Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Capturar pago después de aprobación
     */
    public function captureOrder(Request $request, $orderId)
    {
        $captureRequest = new OrdersCaptureRequest($orderId);
        $captureRequest->prefer('return=representation');

        try {
            $response = $this->client->execute($captureRequest);
            
            if ($response->statusCode === 201) {
                $order = $response->result;
                
                // Marcar orden como pagada en BD
                // $orderRecord = Order::where('paypal_order_id', $orderId)->first();
                // $orderRecord->update(['paid' => true, 'paypal_capture_id' => $order->purchase_units[0]->payments->captures[0]->id]);

                return response()->json([
                    'success' => true,
                    'order' => $order
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Falló la captura'
            ], 400);

        } catch (\Exception $e) {
            Log::error('PayPal Capture Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener URL de aprobación de los links
     */
    private function getApprovalUrl($links)
    {
        foreach ($links as $link) {
            if ($link->rel === 'approve') {
                return $link->href;
            }
        }
        return null;
    }
}
```

#### 5. Rutas PayPal
**routes/api.php**
```php
use App\Http\Controllers\PayPalController;

Route::middleware('api')->group(function () {
    Route::post('/paypal/create-order', [PayPalController::class, 'createOrder']);
    Route::post('/paypal/capture-order/{orderId}', [PayPalController::class, 'captureOrder']);
});

// Rutas de callback (web)
Route::get('/paypal/success', [PayPalController::class, 'success'])->name('paypal.success');
Route::get('/paypal/cancel', [PayPalController::class, 'cancel'])->name('paypal.cancel');
```

---

### Frontend React - PayPal

#### 1. Instalar SDK PayPal
```bash
npm install @paypal/react-paypal-js
```

#### 2. Envolver App con PayPalProvider
**src/main.jsx o App.jsx**
```jsx
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const options = {
    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
    currency: 'EUR',
    intent: 'capture',
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <PayPalScriptProvider options={options}>
            <App />
        </PayPalScriptProvider>
    </React.StrictMode>
);
```

#### 3. Componente PayPalButton
**src/components/PayPalButton.jsx**
```jsx
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { createOrder as createPaypalOrder, captureOrder as capturePaypalOrder } from '../services/paypalService';

const PayPalButtonComponent = ({ amount, onSuccess, onError }) => {
    const [{ isPending }, dispatch] = usePayPalScriptReducer();
    const [loading, setLoading] = useState(false);

    const createOrder = async (data, actions) => {
        setLoading(true);
        try {
            const response = await createPaypalOrder(amount);
            if (response.success) {
                return response.orderID;
            }
            throw new Error(response.error || 'Error creando orden');
        } catch (error) {
            onError?.(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const onApprove = async (data, actions) => {
        setLoading(true);
        try {
            const response = await capturePaypalOrder(data.orderID);
            if (response.success) {
                onSuccess?.(response.order);
            } else {
                onError?.(new Error(response.error));
            }
        } catch (error) {
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const onError = (err) => {
        console.error('PayPal Error:', err);
        onError?.(err);
    };

    return (
        <div className="paypal-button-container">
            {loading && <p>Procesando pago...</p>}
            <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={isPending || loading}
            />
        </div>
    );
};

export default PayPalButtonComponent;
```

#### 4. Servicio PayPal Frontend
**src/services/paypalService.js**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const createOrder = async (amount) => {
    try {
        const response = await axios.post(`${API_URL}/api/paypal/create-order`, {
            amount,
            currency: 'EUR'
        });
        return response.data;
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        return { success: false, error: error.message };
    }
};

export const captureOrder = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/api/paypal/capture-order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        return { success: false, error: error.message };
    }
};
```

#### 5. Variables de Entorno (.env)
```env
VITE_PAYPAL_CLIENT_ID=REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID
VITE_API_URL=http://localhost:8000
```

---

## COMPARATIVA STRIPE vs PAYPAL

| Característica | Stripe | PayPal |
|----------------|--------|--------|
| **Comisión** | ~1.4% + €0.25 | ~2.9% + €0.35 (varía por país) |
| **Tiempo liquidación** | 2-7 días | 1-2 días |
| **Experiencia UX** | Muy fluida, sin salir del sitio | Redirige a PayPal (Checkout) |
| **Métodos de pago** | Tarjetas, Apple Pay, Google Pay, etc. | Cuenta PayPal, tarjetas |
| **Suscripciones** | Excelente (Stripe Billing) | PayPal Subscriptions |
| **Disponible en España** | Sí | Sí |
| **Soporte多 divisa** | Excelente | Excelente |

---

## CONSIDERACIONES DE SEGURIDAD

1. **Nunca expongas claves secretas en el frontend**
2. Usa siempre HTTPS en producción
3. Valida montos en el backend
4. Implementa rate limiting en endpoints de pago
5. Usa webhooks para confirmaciones asíncronas
6. Log de todas las transacciones
7. Cumplimiento PCI-DSS (Stripe lo maneja mayormente)

---

## TESTING

### Stripe
- Modo sandbox con tarjetas test
- `stripe-cli` para probar webhooks localmente
- Dashboard de pruebas: https://dashboard.stripe.com/test

### PayPal
- Sandbox con cuentas test (developer.paypal.com)
- Ambientes de prueba aislados
- Dashboard: https://developer.paypal.com/dashboard

---

## PASOS PARA IMPLEMENTAR

1. **Crear cuentas de desarrollador** en Stripe y/o PayPal
2. **Obtener API keys** de entornos de prueba (sandbox/test)
3. **Backend:** Instalar SDK, crear controladores y rutas
4. **Frontend:** Instalar librerías, crear componentes
5. **Testing:** Probar con credenciales de prueba
6. **Variables de entorno:** Configurar en producción
7. **Webhooks:** Configurar endpoints públicos (ngrok para testing)
8. **Production:** Cambiar a live keys y verificar todo

---

## RECURSOS

- **Stripe Docs:** https://stripe.com/docs
- **PayPal Docs:** https://developer.paypal.com/docs
- **Stripe React:** https://github.com/stripe/stripe-js
- **PayPal React:** https://github.com/paypal/react-paypal-js

---

**Última actualización:** Abril 2026
