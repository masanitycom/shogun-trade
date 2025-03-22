// src/components/layout/Footer.tsx
export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <p>&copy; {new Date().getFullYear()} SHOGUN TRADE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
