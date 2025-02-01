import axios from "axios";
import BaseURL from "./BaseURL";
 
const instance = axios.create({
  baseURL: BaseURL + ":8000/user/",
  headers: {
    Authorization: {
      toString() {
        return `Bearer ${localStorage.getItem("authToken")}`;
      },
    },
    // "Cache-Control": "no-cache",
  },
});
 
export default instance;