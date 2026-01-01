import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Analytics } from '@vercel/analytics/react';

const AdminUsers = () => {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  const users = usersData?.data || [];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'CASHIER':
        return 'bg-green-100 text-green-800';
      case 'USER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Управление пользователями
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата создания
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )} dark:bg-opacity-20`}
                      >
                        {user.role === 'SUPERADMIN' ? 'СуперАдмин' :
                         user.role === 'ADMIN' ? 'Администратор' :
                         user.role === 'CASHIER' ? 'Кассир' :
                         user.role === 'USER' ? 'Пользователь' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default AdminUsers;

