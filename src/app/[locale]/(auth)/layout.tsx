interface AuthLayoutProps {
	children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<div className="flex min-h-screen items-center justify-center p-m-400">
			{children}
		</div>
	)
}

export default AuthLayout
