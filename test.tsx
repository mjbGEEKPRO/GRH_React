import React, { useState } from 'react';
import { useRolesPermissions, useFetcherUsers, useFetcherRoles } from '../../context/AuthorizationContext';
import { Select } from '../../components/Select';
import InputMixted from '../../components/InputMixted';
import { Role, User } from '../../Hooks/definitions';

interface UserOption {
  id: number;
  value: string;
  label: string;
}

interface RoleOption {
  id: number;
  value: string;
  label: string;
}

const AssignRoleForm: React.FC = () => {
  const { state, actions } = useRolesPermissions();
  const { loading, error, message } = state;
  const [userId, setUserId] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const rolesData = useFetcherRoles();
  const usersData = useFetcherUsers();

  // Formatage des options pour les selects
  const users: UserOption[] = usersData.map(user => ({
    id: user.id_user ?? 0,
    value: user.id_user?.toString() ?? '',
    label: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.email || 'Utilisateur sans nom',
  }));

  const roles: RoleOption[] = rolesData.map(role => ({
    id: role.id_role ?? 0,
    value: role.id_role?.toString() ?? '',
    label: role.name ?? 'non défini',
  }));

  // Fonctions de sélection utilisateur et rôle
  const UserSelection = (user: User) => {
    setSelectedUser(user);
    setUserId(user.id_user?.toString() ?? '');
    actions.setSelectedUser(user);
  };

  const RoleSelection = (role: Role) => {
    setSelectedRole(role);
    setRoleId(role.id_role?.toString() ?? '');
    actions.setSelectedRole(role);
  };

  // Composant pour afficher l'avatar utilisateur (bonhomme)
  const UserAvatar = ({ user, size = "large" }: { user: User, size?: "small" | "medium" | "large" }) => {
    const sizeClasses = {
      small: "w-10 h-10",
      medium: "w-16 h-16",
      large: "w-32 h-32",
    };

    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-lg relative flex items-center justify-center text-gray-500`}
      >
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  console.log('roles: ', state.roles.length);
  console.log('users: ', state.users.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !roleId) {
      actions.setMessage('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }
    const role = rolesData.find(r => r.id_role?.toString() === roleId);
    if (!role) {
      actions.setMessage('Rôle invalide.');
      return;
    }
    const result = await actions.assignRoleToUser(userId, role.name ?? '');
    if (result.success) {
      setUserId('');
      setRoleId('');
      setSelectedUser(null);
      setSelectedRole(null);
      actions.setSelectedUser(null);
      actions.setSelectedRole(null);
    }
  };

  if (!actions.hasPermission('roles:assign')) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
        <p className="text-red-500 text-center">
          Vous n'avez pas la permission d'assigner des rôles.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-600 text-white p-6">
            <h1 className="text-2xl font-light">Assigner un rôle à un utilisateur</h1>
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="p-3 mx-6 mt-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 mx-6 mt-4 bg-green-100 text-green-700 rounded-md">
              {message}
            </div>
          )}

          <div className="flex">
            {/* Section utilisateurs */}
            <div className="w-1/2 border-r border-gray-100 bg-gray-50">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-6">
                  Sélectionner un utilisateur
                </h2>
                <div className="space-y-3">
                  {usersData.map((user) => (
                    <div
                      key={user.id_user}
                      onClick={() => UserSelection(user)}
                      className={`p-4 rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                        selectedUser?.id_user === user.id_user
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-white border border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {/* Avatar utilisateur */}
                      <UserAvatar user={user} size="small" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {`${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || 'Utilisateur sans nom'}
                        </div>
                        {user.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {user.email}
                          </div>
                        )}
                      </div>
                      {/* Radio button */}
                      <input
                        type="radio"
                        checked={selectedUser?.id_user === user.id_user}
                        onChange={() => UserSelection(user)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section rôles et aperçu */}
            <div className="w-1/2 p-6">
              {selectedUser ? (
                <div>
                  {/* Aperçu utilisateur sélectionné */}
                  <div className="mb-8 flex items-start space-x-6">
                    <div className="flex flex-col items-center space-y-4">
                      <UserAvatar user={selectedUser} size="large" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-gray-800 mb-2">
                        {`${selectedUser.firstname ?? ''} ${selectedUser.lastname ?? ''}`.trim() || 'Utilisateur sans nom'}
                      </h2>
                      {selectedUser.email && (
                        <p className="text-gray-600">{selectedUser.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Section rôles */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Sélectionner un rôle
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {rolesData.map((role) => (
                          <label
                            key={role.id_role}
                            className="flex items-center cursor-pointer p-2 rounded hover:bg-white"
                          >
                            <input
                              type="radio"
                              checked={selectedRole?.id_role === role.id_role}
                              onChange={() => RoleSelection(role)}
                              className="w-4 h-4 text-blue-600 mr-3"
                            />
                            <span className="text-gray-700">{role.name ?? 'non défini'}</span>
                          </label>
                        ))}
                        <label className="flex items-center cursor-pointer p-2 rounded hover:bg-white">
                          <input
                            type="radio"
                            checked={selectedRole === null}
                            onChange={() => {
                              setSelectedRole(null);
                              setRoleId('');
                              actions.setSelectedRole(null);
                            }}
                            className="w-4 h-4 text-blue-600 mr-3"
                          />
                          <span className="text-gray-500 italic">
                            Aucun rôle
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu de l'assignation */}
                  {selectedRole && (
                    <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Aperçu de l'assignation
                      </h4>
                      <p className="text-blue-700">
                        Le rôle "<span className="font-semibold">{selectedRole.name}</span>" sera assigné à 
                        "<span className="font-semibold">
                          {`${selectedUser.firstname ?? ''} ${selectedUser.lastname ?? ''}`.trim() || selectedUser.email}
                        </span>"
                      </p>
                    </div>
                  )}

                  {/* Bouton d'assignation */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !userId || !roleId}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? 'Assignation...' : 'Assigner le rôle'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg mb-2">
                      Aucun utilisateur sélectionné
                    </h3>
                    <p>Choisissez un utilisateur pour commencer l'assignation</p>
                  </div>
                </div>
              )}
            </div>
                </div>
                </div>
                </div>
                </div>
            
  
  );
};

export { AssignRoleForm };