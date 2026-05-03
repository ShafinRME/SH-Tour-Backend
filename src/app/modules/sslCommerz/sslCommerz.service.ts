/* eslint-disable @typescript-eslint/no-explicit-any */
import SSLCommerzPayment from 'sslcommerz-lts'
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { Payment } from "../payment/payment.model"
import { ISSLCommerz } from "./sslCommerz.interface"

const sslPaymentInit = async (payload: ISSLCommerz) => {
    try {
        const store_id = envVars.SSL.STORE_ID
        const store_pass = envVars.SSL.STORE_PASS
        const is_live = false // ← flip to true for production

        const data = {
            total_amount: payload.amount,
            currency: 'BDT',
            tran_id: payload.transactionId,
            success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: envVars.SSL.SSL_IPN_URL,
            shipping_method: 'N/A',
            product_name: 'Tour',
            product_category: 'Service',
            product_profile: 'general',
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: payload.address,
            cus_add2: 'N/A',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: payload.phoneNumber,
            cus_fax: '01711111111',
            ship_name: 'N/A',
            ship_add1: 'N/A',
            ship_add2: 'N/A',
            ship_city: 'N/A',
            ship_state: 'N/A',
            ship_postcode: 1000,
            ship_country: 'N/A',
        }

        const sslcz = new SSLCommerzPayment(store_id, store_pass, is_live)
        const response = await sslcz.init(data)

        if (!response?.GatewayPageURL) {
            throw new AppError(400, `SSLCommerz init failed: ${response?.failedreason}`)
        }

        return response

    } catch (error: any) {
        throw new AppError(400, error.message)
    }
}

const validatePayment = async (payload: any) => {
    try {
        const sslcz = new SSLCommerzPayment(
            envVars.SSL.STORE_ID,
            envVars.SSL.STORE_PASS,
            false
        )

        const response = await sslcz.validate({ val_id: payload.val_id })

        await Payment.updateOne(
            { transactionId: payload.tran_id },
            { paymentGatewayData: response },
            { runValidators: true }
        )
    } catch (error: any) {
        throw new AppError(401, `Payment Validation Error: ${error.message}`)
    }
}

export const SSLService = { sslPaymentInit, validatePayment }