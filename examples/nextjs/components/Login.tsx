import { useUser } from "@supabase/auth-helpers-react"
import Link from "next/link";

export const Login: React.FC = () => {
    const { user } = useUser();
    return user ? (<Link href="/api/auth/logout">
        Logout
    </Link>) : (<Link href="/">
        Sign in
    </Link>)
}