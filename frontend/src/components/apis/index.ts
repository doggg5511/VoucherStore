import axios from "axios";
import {COINMARKETCAP_BASE_URL, PROXY} from "@/lib/constants.ts";

export const getJpyPrice = async () => {
    const {data} = await axios.get(`${PROXY}${COINMARKETCAP_BASE_URL}cryptocurrency/quotes/latest?slug=tether&convert=JPY&CMC_PRO_API_KEY=31449c46-239c-478a-8ebf-732898199e0d`)
    return data?.data['825']
};
