import { useState } from "react";
import { Button } from "../../../components/Button";
import { useFetcherPermissions, useFetcherRoles, useFetcherUsers, useRolesPermissions } from "../../../context/AuthorizationContext";
import { Permission, User } from "../../../Hooks/definitions";

interface CardUserDetailsProps {
    User?: User;
    action?: () => void;
}

// type DateFromatValue = {
//     month: number | null,
//     year: number | null
// }



const DetailsCardUser: React.FC<CardUserDetailsProps> = ({User}) =>{
    const { state, actions } = useRolesPermissions();
    function getDayFromDate(date: string | Date | undefined): number | string {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.getDay();
    }

    // const hasPermission = (currentPerm: string[], userPerm: Partial<Permission>[], mode?: 'any' | 'all' ): boolean => {
        
    //     return actions.userHasPermissions([currentPerm], userPerm as Partial<Permission>[], mode)
    // }

    function getMonthYearFromDate(date: string | Date | undefined): string {
        if (!date) return '--/----';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const monthNames = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ];
        return `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    const rolesData = useFetcherRoles();
    const permissionData = useFetcherPermissions();
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

        
    const assingRole = async(userId: string, roleName: string) =>{
        console.log('assignation');
        console.log("role et id user", userId, roleName)
        let result = await actions.assignRoleToUser(userId, roleName );
        result.success ? setToast({ type: 'success', message: result.message ?? 'Role assigné avec succès !' }) :
            setToast({ type: 'error', message: result.message ?? `echec d'assignation du role ${roleName} !` });
    }

    const choosePermissions = (perm: string)=>{
        const currentPermissions = state.choosedPermissions ?? [];

    let updatedPermissions;
        console.log("permission update", currentPermissions)
    if (currentPermissions.includes(perm)) {
        // Supprimer si déjà sélectionnée
        updatedPermissions = currentPermissions.filter(p => p !== perm);
    } else {
        // Ajouter la permission
        updatedPermissions = [...currentPermissions, perm];
    }

    actions.setChoosedPermissions(updatedPermissions);
    }
    const assingSelectedPermissions = async()=>{
        console.log("debut ", state.choosedPermissions);
        
        if (state.choosedPermissions && state.choosedPermissions.length > 0 ) {
            let result = await actions.assignPermissionToUser();
             result.success ? setToast({ type: 'success', message: result.message ?? 'Permission assignée avec succès !' }) :
                    setToast({ type: 'error', message: result.message ?? `echec d'assignation de la permission !` });
        }
    }
    
    return(
        <>  
            {User ? (<>
            {/* {JSON.stringify(User)} */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 flex-shrink-0">
                            <img
                                className="w-full h-48 object-cover rounded-lg sm:rounded-l-lg sm:rounded-r-none"
                                // src={User.avatar}
                                src="https://cdn.pixabay.com/photo/2021/09/02/16/48/cat-6593947_960_720.jpg"
                                alt={`${User.firstname} ${User.lastname} avatar`}
                            />
                        </div>
                        <div className="p-4 flex-1">
                            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                {User.role?.name}
                            </div>
                            <p className="mt-1 text-lg font-medium text-gray-900">
                                {User.firstname} {User.lastname}

                            </p>
                            <p className="mt-2 text-gray-500">
                                {User.role?.description} <br />
                               {/* {JSON.stringify(User.permissions) } */}
                            </p>
                            <p className="mt-2 text-gray-500">
                                a la permission de : <br />
                                <div className="flex justify-center items-center gap-1 flex-wrap">
                                    {User.permissions.map((perm, index) => (
                                        <li
                                            key={index}
                                            className={` flex-shrink-0 list-decimal font-medium text-green-800 flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer`}>
                                            <span className="text-gray-700 text-xs ">{perm.description}</span>
                                        </li>
                                        ))}
                                </div>
                            </p>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">
                            Sélectionner un rôle
                        </h3>
                        <p>Role sélectionné: {state.selectedRole?.name}</p>
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-slate-900">
                            <div className="space-y-3 grid grid-cols-3 ">
                            {rolesData.map((role) => (
                                <div className='flex' key={role.id_role} >
                                    <Button icon={
                                        `ri-${state.selectedUser?.role?.name === role.name  ? 'checkbox-circle' : 'checkbox-blank-circle'}-line`
                                        }   
                                        iconPosition='left'
                                        supStyle={`text-${state.selectedUser?.role?.name === role.name ? 'green': 'slate'}-500`}
                                        action={() => actions.setSelectedRole(role)} variant='perso'>
                                        
                                        {role.description}
                                    </Button>
                                </div>
                            ))}
                            </div>
                             <Button  action={() => {
                            if (state.selectedUser && state.selectedRole) {
                            assingRole(state.selectedUser.id_user, state.selectedRole.name);
                            } else {
                            console.log("Aucun utilisateur ou rôle sélectionné");
                            setToast({ type: 'error', message: "Sélectionne un utilisateur et un rôle" });
                            }
                                }} 
                            supStyle='my-1'>enregistrer</Button> 
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-700  mb-4">
                            Total permissions {User.permissions.length}
                        </h2>
                        <h3 className="text-lg font-medium text-gray-700 mb-4">
                            Sélectionner les permissions
                        </h3>
                        <p>Permission sélectionné: {JSON.stringify(state.choosedPermissions)}</p>
                        <div className="grid grid-cols-4 gap-4  h-[28vh] overflow-y-auto  shadow-black py-2">
                            {permissionData.map((perm,index) => (
                                <Button icon={
                                    `ri-${actions.userHasPermissions([perm.name ?? ''], User.permissions as Partial<Permission>[], 'any')  ? 'checkbox-circle' : 'checkbox-blank-circle'}-line`
                                    }   
                                    key={index}
                                    iconPosition='left'
                                    supStyle={`text-${actions.userHasPermissions([perm.name ?? ''], User.permissions as Partial<Permission>[], 'any') ? 'green': 'slate'}-500`}
                                    action={() => choosePermissions(perm.name ?? '')} variant='perso'>
                                    {perm.description}
                                </Button>
                            ))}
                        </div>
                        <Button action={assingSelectedPermissions} supStyle='my-2'>enregistrer</Button>
                    </div>
                </div>
                            {/* // <label
                            //     key={perm.id_permission}
                            //     className={`bg-${actions.userHasPermissions([perm.name ?? ''], User.permissions as Partial<Permission>[], 'any') ? 'green' : 'gray' }-50
                            //     flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer`}>
                                
                            //     <span className="text-gray-700 text-xs ">{perm.description}</span>
                            // </label> */}
                {/* <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="pr-4">
                        <p className="text-4xl font-bold text-gray-900">{getDayFromDate(User?.created_at)} </p>
                        <p className="text-sm text-gray-500">{getMonthYearFromDate(User?.created_at)}</p>
                        </div>
                        <div className="flex-1">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                            Événement planifié
                        </div>
                        <p className="mt-2 text-sm text-gray-500">9:20 - 9:40</p>
                        <p className="mt-2 text-gray-500">
                            Détails de l'événement... Lorem ipsum dolor sit amet.
                        </p>
                        </div>
                    </div>
                </div> */}
            </>               
            ):(
            <div className='bg-slate-200 h-1/2 w-full flex justify-center items-center '>
                <p>
                    Aucun utilisateur sélectionné
                </p> 
            </div>
            )}
        </>
    );
}

export {DetailsCardUser};