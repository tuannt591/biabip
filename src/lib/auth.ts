import { setCookie, getCookie, CookieValueTypes } from 'cookies-next';

export const getOtp = async (phone: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USS_API_URL}/auth/get_otp_new`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: phone,
        apikey: process.env.NEXT_PUBLIC_API_KEY!,
        language: 'Vi',
        method: 'Sms',
        otp_type: 'Login'
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get OTP');
  }

  return response.json();
};

export const verifyOtp = async (phone: string, otp: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USS_API_URL}/auth/otp_login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: phone,
        method: 'Sms',
        apikey: process.env.NEXT_PUBLIC_API_KEY!,
        otp: otp
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify OTP');
  }

  const data = await response.json();
  const { token, user_id } = data;
  const userInfo = await getUserInfo(user_id, token);
  const user = { ...userInfo, token };

  return user;
};

export const getUserInfo = async (userId: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USS_API_URL}/users/${userId}?project_id=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify OTP');
  }

  return response.json();
};

export const setSession = (user: any) => {
  setCookie('session', JSON.stringify(user), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
};

export const getSession = async () => {
  const session = await getCookie('session');
  if (typeof session === 'string') {
    return JSON.parse(session);
  }
  return null;
};

export const removeSession = () => {
  setCookie('session', '', {
    maxAge: -1,
    path: '/'
  });
};

export const updateUser = async (name: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USS_API_URL}/users/update`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, about_me: '' })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
};

export const getBatchUsers = async (userIds: string[], token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USS_API_URL}/users/batch?page=1&page_size=10000`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        users: userIds,
        project_id: process.env.NEXT_PUBLIC_PROJECT_ID
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get batch users');
  }

  return response.json();
};

export const createTable = async (tableName: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BIABIP_API_URL}/api/tables`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tableName })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create table');
  }

  return response.json();
};

export const getTableById = async (tableId: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BIABIP_API_URL}/api/tables/${tableId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get table');
  }

  return response.json();
};

export const joinTable = async (
  tableId: string,
  userId: string,
  token: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BIABIP_API_URL}/api/tables/${tableId}/players`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to join table');
  }

  return response.json();
};
