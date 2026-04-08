import Link from "next/link";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";

const Header = async ({ user }: { user: User }) => {
    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/" className="text-2xl font-bold tracking-wide cursor-pointer">
                    UMATP
                </Link>
                <nav className="hidden sm:block">
                    <NavItems />
                </nav>

                <UserDropdown user={user} />
            </div>
        </header>
    )
}
export default Header
