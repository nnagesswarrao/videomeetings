import React, { useState } from 'react';
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
    useColorMode,
    useColorModeValue
} from '@chakra-ui/react';
import { 
    SearchIcon, 
    BellIcon, 
    MoonIcon, 
    SunIcon, 
    SettingsIcon, 
    ChatIcon,
    QuestionOutlineIcon
} from '@chakra-ui/icons';

const Header = ({ 
    title = 'Teams Meeting', 
    user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://bit.ly/dan-abramov'
    }
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { colorMode, toggleColorMode } = useColorMode();

    const headerBg = useColorModeValue('white', 'gray.800');
    const headerShadow = useColorModeValue('md', 'dark-lg');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const headerActions = [
        { 
            icon: <ChatIcon />, 
            label: 'Messages',
            onClick: () => console.log('Open Messages')
        },
        { 
            icon: <BellIcon />, 
            label: 'Notifications',
            onClick: () => console.log('Open Notifications')
        },
        { 
            icon: colorMode === 'light' ? <MoonIcon /> : <SunIcon />, 
            label: `Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`,
            onClick: toggleColorMode
        }
    ];

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="nowrap"
            padding="0.5rem 2rem"
            bg={headerBg}
            boxShadow={headerShadow}
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
                    color={useColorModeValue('blue.600', 'blue.300')}
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
                    bg={useColorModeValue('gray.100', 'gray.700')}
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
                    <SearchIcon color={useColorModeValue('gray.500', 'gray.300')} />
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
                            color={useColorModeValue('gray.600', 'gray.300')}
                            mr={2}
                            onClick={action.onClick}
                            _hover={{
                                bg: useColorModeValue('gray.100', 'gray.700'),
                                color: useColorModeValue('blue.600', 'blue.300')
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
                            onClick={() => console.log('Open Settings')}
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
                            onClick={() => console.log('Logout')}
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
