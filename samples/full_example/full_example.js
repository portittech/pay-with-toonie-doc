const baseUrl = "https://<ENVIRONMENT_API_URL>";
const successUrl = "<SUCCESS_PAGE_URL>";
const errorUrl = "<ERROR_PAGE_URL>";

// Auth to get token
// ATTENTION: MAKE SURE NOT TO INCLUDE THIS AUTHENTICATION SNIPPET IN YOUR CLIENTSIDE APPLICATION
// THIS HAS BEEN DONE FOR DEMONSTRATION PURPOSES ONLY!!!!
const getTokenData = async () => {
    const tokenRes = await fetch(`${baseUrl}/auth/realms/toonie/protocol/openid-connect/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "client_id": "paywithtoonie-client",
            "username": "<USERNAME>",
            "password": "<PASSWORD>",
        }),
    });

    return await tokenRes.json();
}

// CREATE PAYMENT SESSION
const createPaymentSession = async (amount, currency, reason) => {
    const tokenData = await getTokenData();

    const res = await fetch(`${baseUrl}/acquiring/v1/payment`, {
        method: "POST",
        headers: {
            Authorization: ` Bearer ${tokenData.access_token}`,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "amount": amount,
            "currency": currency,
            "reason": reason,
            "successUrl": successUrl,
            "errorUrl": errorUrl,
        })
    })

    const data = await res.json()

    return {
        paymentSessionId: data.sessionId,
        amount: data.amount,
        currency: data.currency,
        successUrl: data.successUrl,
        errorUrl: data.errorUrl,
        reason: data.reason,
        otp: data.otp,
        paymentShortReference: data.shortReference,
        displayName: data.displayName,
    }
};

// GET PAYMENT DATA BY SESSION ID
const fetchPaymentDataBySessionId = async (paymentSessionId) => {
    const res = await fetch(`${baseUrl}/acquiring/v1/payment/paymentSession/${paymentSessionId}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    })

    const data = await res.json()

    return {
        paymentSessionId: data.sessionId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        successUrl: data.successUrl,
        errorUrl: data.errorUrl,
        displayName: data.displayName,
    }
}

// INITIATE A PAYMENT
const initiatePayment = async (paymentSessionId, amount, currency, provider) => {
    const res = await fetch(`${baseUrl}/acquiring/v1/payment/initiate`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "paymentSessionId": paymentSessionId,
            "provider": provider,
        }),
    });

    const data = await res.json();

    return {
        "amount": data.amount,
        "currency": data.currency,
        "reason": data.reason,
        "clientSecret": data.clientSecret,
        "stripePaymentIntentId": data.paymentIntentId,
        "feeAmount": data.feeAmount,
        "otp": data.provider.otp,
        "offersSessionId": data.provider.paymentOfferSessionId,
        "paymentShortReference": data.provider.shortReference,
    };
}

// UPDATE PAYMENT
const updatePayment = async (paymentSessionId, paymentStatus) => {
    return await fetch(`${baseUrl}/acquiring/v1/payment/${paymentSessionId}/status/${paymentStatus}`, {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        }
    });
}

/**
 * CARD
 */

  // APPROVE CARD PAYMENT
const approveCardPayment = async (paymentSessionId) => {
    return await fetch(`${baseUrl}/acquiring/v1/payment/${paymentSessionId}/approve`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
    });
}

/**
 * CALLBACKS
 */

const successPaymentCallback = (data) => {
    console.log("success", data)
}

const failurePaymentCallback = (err) => {
    console.log("userError", err);
}

const onModalClose = (error) => {
    if (error) {
        console.error("paymentError", error)
    }
}

const renderPayWithToonieButton = true;
const renderPayWithCardButton = true;

const options = {
    getTokenData,
    createPaymentSession,
    fetchPaymentDataBySessionId,
    initiatePayment,
    updatePayment,
    approveCardPayment,
    successPaymentCallback,
    failurePaymentCallback,
    onModalClose,
    baseUrl,
    renderPayWithToonieButton,
    renderPayWithCardButton,
}

// builds the UI for the form
PayWithToonie.render(document.querySelector("#toonie-button"), options);