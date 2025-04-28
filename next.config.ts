import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: false,
	},
};
export default nextConfig;
