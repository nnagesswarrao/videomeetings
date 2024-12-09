import React from 'react';
import { 
    Box, 
    Flex, 
    Input, 
    Text, 
    Avatar, 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { 
    SearchIcon, 
    BellIcon, 
    MoonIcon, 
    SunIcon, 
    SettingsIcon, 
    ChatIcon,
    QuestionOutlineIcon,
    ArrowForwardIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const lightColors = {
    headerBg: 'white',
    headerShadow: 'md',
    textColor: 'blue.600',
    inputBg: 'gray.100',
    iconColor: 'gray.500',
    actionColor: 'gray.600',
    hoverBg: 'gray.100',
    hoverColor: 'blue.600'
};

const darkColors = {
    headerBg: 'gray.800',
    headerShadow: 'dark-lg',
    textColor: 'blue.300',
    inputBg: 'gray.700',
    iconColor: 'gray.300',
    actionColor: 'gray.300',
    hoverBg: 'gray.700',
    hoverColor: 'blue.300'
};

const Header = ({ 
    title = 'Teams Meeting', 
    user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://bit.ly/dan-abramov'
    },
    onLogout
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();

    // Compute color values based on color mode
    const colors = colorMode === 'light' ? lightColors : darkColors;

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Memoize header actions to prevent unnecessary re-renders
    const headerActions = React.useMemo(() => [
        { 
            icon: <ChatIcon />, 
            label: 'Messages',
            onClick: () => navigate('/chat')
        },
        { 
            icon: <BellIcon />, 
            label: 'Notifications',
            onClick: () => console.log('Open Notifications')
        },
        { 
            // Pre-compute icon and label outside of render
            icon: colorMode === 'light' ? <MoonIcon /> : <SunIcon />, 
            label: `Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`,
            onClick: toggleColorMode
        }
    ], [colorMode, toggleColorMode, navigate]);

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="nowrap"
            padding="0.5rem 2rem"
            bg={colors.headerBg}
            boxShadow={colors.headerShadow}
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="1000"
        >
            {/* Application Logo and Title */}
            <Flex align="center">
                <Text 
                    fontSize="2xl" 
                    fontWeight="bold" 
                    color={colors.textColor}
                    mr={6}
                >
                    {title}
                </Text>
            </Flex>

            {/* Search Bar */}
            <Flex 
                flex={1} 
                maxWidth="500px" 
                mx={6}
                position="relative"
            >
                <Input 
                    placeholder="Search meetings, people, files..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="filled"
                    bg={colors.inputBg}
                    borderRadius="full"
                    pl="2.5rem"
                    pr="1rem"
                />
                <Box 
                    position="absolute" 
                    left="0.75rem" 
                    top="50%" 
                    transform="translateY(-50%)"
                >
                    <SearchIcon color={colors.iconColor} />
                </Box>
            </Flex>

            {/* Header Actions */}
            <Flex align="center">
                {headerActions.map((action, index) => (
                    <Tooltip 
                        key={index} 
                        label={action.label} 
                        aria-label={action.label}
                    >
                        <IconButton
                            icon={action.icon}
                            variant="ghost"
                            color={colors.actionColor}
                            mr={2}
                            onClick={action.onClick}
                            _hover={{
                                bg: colors.hoverBg,
                                color: colors.hoverColor
                            }}
                        />
                    </Tooltip>
                ))}

                {/* User Profile Menu */}
                <Menu>
                    <Tooltip label={user.name}>
                        <MenuButton 
                            as={Avatar}
                            size="sm"
                            name={user.name}
                            src={user.avatar}
                            cursor="pointer"
                            ml={2}
                        />
                    </Tooltip>
                    <MenuList>
                        <MenuItem 
                            icon={<SettingsIcon />}
                            onClick={() => navigate('/profile')}
                        >
                            Settings
                        </MenuItem>
                        <MenuItem 
                            icon={<QuestionOutlineIcon />}
                            onClick={() => console.log('Open Help')}
                        >
                            Help
                        </MenuItem>
                        <MenuItem 
                            color="red.500"
                            icon={<ArrowForwardIcon />}
                            onClick={() => {
                                onLogout && onLogout();
                                navigate('/login');
                            }}
                        >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
    );
};

export default Header;
