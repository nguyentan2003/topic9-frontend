import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import styles from "./Login.module.css";

// Kiểu dữ liệu cho form
interface LoginFormInputs {
    username: string;
    password: string;
}

// Kiểu response từ server
interface ApiResponse {
    code: number;
    message?: string;
    result?: {
        token: string;
        expiryTime?: string | null;
    };
}

// Hàm giải mã JWT để lấy thông tin user
const decodeJwt = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload; // { iss, sub, exp, iat, jti, scope }
    } catch (err) {
        console.error("Lỗi giải mã JWT:", err);
        return null;
    }
};

export default function Login() {
    const { register, handleSubmit } = useForm<LoginFormInputs>();
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    // Xóa token cũ nếu có
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        try {
            const response = await axios.post<ApiResponse>(
                "http://localhost:8888/api/v1/identity/auth/token",
                data
            );

            // Kiểm tra mã phản hồi
            if (response.data.code === 1000 && response.data.result?.token) {
                const token = response.data.result.token;
                const decoded = decodeJwt(token);

                if (decoded) {
                    // Lưu thông tin vào localStorage
                    localStorage.setItem("token", token);
                    localStorage.setItem("userId", decoded.sub);
                    localStorage.setItem("role", decoded.scope);

                    alert("Đăng nhập thành công!");
                    if (decoded.scope === "ROLE_ADMIN") navigate("/admin-page");
                    else navigate("/user-page");
                } else {
                    setError("Không thể giải mã token!");
                }
            } else {
                // code khác 1000 → thất bại
                setError(
                    response.data.message || "Sai tên đăng nhập hoặc mật khẩu!"
                );
            }
        } catch (err) {
            console.error("Lỗi xảy ra:", err);
            const axiosError = err as AxiosError;
            if (axiosError.response) {
                console.error("Phản hồi lỗi:", axiosError.response.data);
            }
            setError("Không thể kết nối tới máy chủ!");
        }
    };

    return (
        <div className={styles.body_login}>
            <div className={styles.container}>
                <h2 className={styles.title}>Đăng nhập</h2>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input
                            type="text"
                            {...register("username", { required: true })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            {...register("password", { required: true })}
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
}
