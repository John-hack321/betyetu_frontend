import { User, LayoutDashboard, Trophy, Sword , Menu} from 'lucide-react';

export const navBarIcons = [
    {
        'name' : "dashboard",
        'icon' : <LayoutDashboard/>,
        'redirectPath' : "/dashboard",
    },
    {
        'name' : "tournaments",
        'icon' : <Trophy/>,
        'redirectPath' : "/tournaments",
    },
    {
        'name' : "matches",
        'icon' : <Sword/>,
        'redirectPath' : "/matches",
    },
    {
        'name' : "profile",
        'icon' : <User/>,
        'redirectPath' : "/profile",
    }
]

export const hambagerMenu = <Menu/>
