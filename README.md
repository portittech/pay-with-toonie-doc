# Pay with Toonie
![Pay With Toonie](imgs/pay_with_toonie_button.png)

## Introduction
This constitutes the official documentation of the "Pay with Toonie" online payments solution.

In its current implementation the integration is composed of two different implementations, both required:
- **REST API**: Authenticated Serverside integration to initiate the Payment Session to be passed to the client-side application
- **Vanilla JS Component**: Client-side integration of the "Pay with Toonie Button" User Experience, able to handle QR generation, polling and communication with the payment API.

## The Flow
>> TODO : add here flow diagram.

## REST API Integration

### Authentication
In order to initialize a new payment session, it is necessary to perform a very basic integration to Toonie's Authentication endpoint.



```js
// Auth to get token
    const tokenRes = await fetch('https://<ENVIRONMENT_AUTH_URL>/auth/realms/toonie/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "client_id": "toonie-client",
            "username": "customerusername",
            "password": "customerpassword",
        })
    });
```

In this first version of the integration, the only supported authentication method is `username/password`.

>*Note: Authentication via a combination of `APIKey/APISecret` is already being developed.*

### Browsable API Specification
You can find an interactive API Specification [here](https://portitpaywithtoonie.docs.apiary.io)

### Endpoints

#### **DEMO**
ENVIRONMENT_AUTH_URL: _please get in touch with one of our representatives_  
ENVIRONMENT_API_URL: _please get in touch with one of our representatives_

#### **PROD**
ENVIRONMENT_AUTH_URL: `https://auth.toonieglobal.com`  
ENVIRONMENT_API_URL: `https://api.toonieglobal.com`


## JS Component Integration
1. Import pay-with-toonie script and css file. You can modify styles using `classNames`
2. Add a place where the button should be shown. ex. `<div id='my-example'></div>`
3. Call the `renderPayWithToonie` method. ex. `renderPayWithToonie(document.querySelector("#my-example"), options)`


`options` is an object with 3 parameters:
* `getPaymentData` is an async function where the create payment session should be called (Authenticated), and should return `paymentShortReference`, `otp` and `paymentSessionID`
* `successPaymentCallback: (data) => void` - (optional)
* `failurePaymentCallback: (error: Error) => void` - (optional)


## Roadmap
Here below some of the key aspects that have been insert in the product roadmap.

- [x] MVP Release - QR Code Scan-to-pay
- [ ] Short Reference Payment
- [ ] APIKey/APISecret Authentication Method
- [ ] Clientside-only JS Integration (No API Integration Required)
- [ ] Component Templating
- [ ] E-commerce platforms plugin/integration


## Complete Selfcointained JS Snippet

This snippet is performing what would normally be done serverside and clientside to just show a full implementation of the service.
  

>**WARNING: Do NOT perform any authenticated operation on a Single Page Application or on any client-side app**

```js
 const getPaymentData = async() => {
        
    // Auth to get token
    const tokenRes = await fetch('https://<ENVIRONMENT_AUTH_URL>/auth/realms/toonie/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "client_id": "toonie-client",
            "username": "customerusername",
            "password": "customerpassword",
        })
    });

    const tokenData = await tokenRes.json()

        //Create payment intent
    const res  = await fetch('https://<ENVIRONMENT_API_URL>/offers/v1/payments', {
        method: 'POST',
        headers: {
            Authorization: ` Bearer ${tokenData.access_token}`,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "amount": "0.05",
            "reason": "testing 1",
            "destinationWalletId": "<MERCHANTWALLETID>",
            "transactionCurrency": "EUR"
        })
    })

    const data = await res.json()
    
    // Data to be consumed by the SDK
    return { 
        paymentSessionId: data.paymentSessionId,
        otp: data.otp,
        paymentShortReference: data.shortReference
        }
    };

const failurePaymentCallback = (err) => {
    console.log('userError', err)
}

renderPayWithToonie(document.querySelector("#my-example-div"), { getPaymentData, failurePaymentCallback })
```

