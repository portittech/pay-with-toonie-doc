const getPaymentData = async() => {
        
    // Auth to get token
    // ATTENTION: MAKE SURE NOT TO INCLUDE THIS AUTHENTICATION SNIPPET IN YOUR CLIENTSIDE APPLICATION
    // THIS HAS BEEN DONE FOR DEMONSTRATION PURPOSES ONLY!!!!
    const tokenRes = await fetch('https://<ENVIRONMENT_AUTH_URL>/auth/realms/toonie/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "client_id": "pay-with-toonie",
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
            "reason": "Test Payment 01",
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

renderPayWithToonie(document.querySelector("#toonie-button"), { getPaymentData, failurePaymentCallback })