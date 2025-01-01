import React, { useState } from 'react';
import { 
    Box, 
    Container,
    VStack, 
    HStack,
    Heading, 
    Text,
    Button,
    Avatar,
    FormControl, 
    FormLabel, 
    Input, 
    Divider,
    useColorMode,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    Icon,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    InputGroup,
    InputRightElement,
    IconButton,
    Switch,
    Select
} from '@chakra-ui/react';
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaBuilding, 
    FaEdit,
    FaCamera,
    FaLock,
    FaBell,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaLanguage
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { colorMode } = useColorMode();
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        avatar: user?.avatar || 'https://bit.ly/dan-abramov'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: false,
        language: 'English'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSettingChange = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleSubmit = async () => {
        try {
            await updateUser(formData);
            toast({
                title: 'Profile updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: 'Error updating profile',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: 'Passwords do not match',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        try {
            // Add your password update logic here
            toast({
                title: 'Password updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast({
                title: 'Error updating password',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Card
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
                boxShadow="xl"
                borderRadius="xl"
                overflow="hidden"
            >
                {/* Profile Header */}
                <Box
                    bg={colorMode === 'light' ? 'blue.500' : 'blue.700'}
                    h="200px"
                    position="relative"
                >
                    <Box
                        position="absolute"
                        bottom="-50px"
                        left="50%"
                        transform="translateX(-50%)"
                    >
                    <Avatar 
                        size="2xl" 
                            name={formData.name}
                            src={formData.avatar}
                            border="4px solid"
                            borderColor={colorMode === 'light' ? 'white' : 'gray.700'}
                        />
                        {isEditing && (
                            <Button
                                size="sm"
                                rounded="full"
                                position="absolute"
                                bottom="0"
                                right="0"
                                colorScheme="blue"
                            >
                                <Icon as={FaCamera} />
                            </Button>
                        )}
                    </Box>
                </Box>

                <CardBody pt="60px">
                    <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
                        <TabList mb="1em">
                            <Tab><Icon as={FaUser} mr={2} /> Profile</Tab>
                            <Tab><Icon as={FaLock} mr={2} /> Security</Tab>
                            <Tab><Icon as={FaBell} mr={2} /> Preferences</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Profile Tab */}
                            <TabPanel>
                                <VStack spacing={8}>
                                    {/* Profile Info */}
                                    <VStack spacing={2} textAlign="center">
                                        <Heading size="lg">{formData.name}</Heading>
                                        <Text color="gray.500">{formData.department}</Text>
                                        <Button
                                            leftIcon={<FaEdit />}
                                            size="sm"
                                            colorScheme="blue"
                                            variant="ghost"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                        </Button>
                                    </VStack>

                                    <Divider />

                                    {/* Profile Details */}
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                    <FormControl>
                                            <FormLabel>
                                                <HStack>
                                                    <Icon as={FaUser} />
                                                    <Text>Full Name</Text>
                                                </HStack>
                                            </FormLabel>
                        <Input 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                isReadOnly={!isEditing}
                                                bg={!isEditing && (colorMode === 'light' ? 'gray.50' : 'gray.600')}
                        />
                    </FormControl>

                    <FormControl>
                                            <FormLabel>
                                                <HStack>
                                                    <Icon as={FaEnvelope} />
                                                    <Text>Email</Text>
                                                </HStack>
                                            </FormLabel>
                        <Input 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isReadOnly={!isEditing}
                                                bg={!isEditing && (colorMode === 'light' ? 'gray.50' : 'gray.600')}
                        />
                    </FormControl>

                    <FormControl>
                                            <FormLabel>
                                                <HStack>
                                                    <Icon as={FaPhone} />
                                                    <Text>Phone</Text>
                                                </HStack>
                                            </FormLabel>
                        <Input 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                isReadOnly={!isEditing}
                                                bg={!isEditing && (colorMode === 'light' ? 'gray.50' : 'gray.600')}
                        />
                    </FormControl>

                    <FormControl>
                                            <FormLabel>
                                                <HStack>
                                                    <Icon as={FaBuilding} />
                                                    <Text>Department</Text>
                                                </HStack>
                                            </FormLabel>
                        <Input 
                            name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                isReadOnly={!isEditing}
                                                bg={!isEditing && (colorMode === 'light' ? 'gray.50' : 'gray.600')}
                                            />
                                        </FormControl>
                                    </SimpleGrid>

                                    {/* Save Button */}
                                    {isEditing && (
                                        <Button
                                            colorScheme="blue"
                                            size="lg"
                                            width="full"
                                            onClick={handleSubmit}
                                        >
                                            Save Changes
                                        </Button>
                                    )}
                                </VStack>
                            </TabPanel>

                            {/* Security Tab */}
                            <TabPanel>
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md">Change Password</Heading>
                                    <FormControl>
                                        <FormLabel>Current Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    variant="ghost"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>New Password</FormLabel>
                                        <Input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                        />
                    </FormControl>

                    <FormControl>
                                        <FormLabel>Confirm New Password</FormLabel>
                        <Input 
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                        />
                    </FormControl>

                    <Button 
                        colorScheme="blue" 
                                        onClick={handlePasswordSubmit}
                    >
                                        Update Password
                    </Button>

                                    <Divider my={4} />

                                    <Heading size="md">Two-Factor Authentication</Heading>
                                    <HStack justify="space-between">
                                        <Text>Enable 2FA</Text>
                                        <Switch
                                            isChecked={settings.twoFactorAuth}
                                            onChange={() => handleSettingChange('twoFactorAuth')}
                                        />
                                    </HStack>
                </VStack>
                            </TabPanel>

                            {/* Preferences Tab */}
                            <TabPanel>
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md">Notifications</Heading>
                                    <HStack justify="space-between">
                                        <Text>Email Notifications</Text>
                                        <Switch
                                            isChecked={settings.emailNotifications}
                                            onChange={() => handleSettingChange('emailNotifications')}
                                        />
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>SMS Notifications</Text>
                                        <Switch
                                            isChecked={settings.smsNotifications}
                                            onChange={() => handleSettingChange('smsNotifications')}
                                        />
                                    </HStack>

                                    <Divider my={4} />

                                    <Heading size="md">Language</Heading>
                                    <FormControl>
                                        <Select
                                            value={settings.language}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                language: e.target.value
                                            }))}
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                        </Select>
                                    </FormControl>
            </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ProfilePage;
