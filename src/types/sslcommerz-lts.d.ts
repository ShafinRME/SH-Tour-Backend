declare module 'sslcommerz-lts' {
    interface SSLCommerzData {
        total_amount: number
        currency: string
        tran_id: string
        success_url: string
        fail_url: string
        cancel_url: string
        ipn_url: string
        shipping_method: string
        product_name: string
        product_category: string
        product_profile: string
        cus_name: string
        cus_email: string
        cus_add1: string
        cus_add2?: string
        cus_city: string
        cus_state: string
        cus_postcode: string
        cus_country: string
        cus_phone: string
        cus_fax?: string
        ship_name?: string
        ship_add1?: string
        ship_add2?: string
        ship_city?: string
        ship_state?: string
        ship_postcode?: number
        ship_country?: string
        [key: string]: unknown
    }

    interface SSLCommerzResponse {
        status: string
        failedreason: string
        sessionkey: string
        GatewayPageURL: string
        storeBanner: string
        storelogo: string
        desc: unknown[]
        is_direct_pay_enable: string
        [key: string]: unknown
    }

    class SSLCommerzPayment {
        constructor(store_id: string, store_passwd: string, is_live: boolean)
        init(data: SSLCommerzData): Promise<SSLCommerzResponse>
        validate(data: { val_id: string }): Promise<unknown>
    }

    export default SSLCommerzPayment
}