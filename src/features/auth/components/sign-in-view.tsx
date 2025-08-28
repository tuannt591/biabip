import UserAuthForm from './user-auth-form';

export default function SignInViewPage() {
  return (
    <div className='relative flex h-screen items-center justify-center'>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
