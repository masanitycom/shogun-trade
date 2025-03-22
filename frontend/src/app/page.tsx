// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">SHOGUN TRADE</h1>
          <p className="text-xl text-gray-600">
            NFT投資とMLM機能を組み合わせた革新的なプラットフォーム
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">SHOGUN TRADEの特徴</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-lg mb-2">NFT投資</h3>
              <p>様々な価格帯のNFTに投資し、日利0.5%〜2.0%の報酬を獲得できます。</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-lg mb-2">MLMランク制度</h3>
              <p>「天下統一への道」ランク制度で、組織の成長に応じた報酬を獲得できます。</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-lg mb-2">週次報酬</h3>
              <p>週次で報酬を受け取るか、複利運用するかを選択できます。</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg mb-2">特別NFT</h3>
              <p>特別な機会に限定NFTを獲得するチャンスがあります。</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg inline-block"
          >
            今すぐ登録する
          </Link>
          <p className="mt-4 text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/login" className="text-blue-600 hover:underline">
              こちらからログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
