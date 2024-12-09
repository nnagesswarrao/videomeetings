import React from 'react';
import { 
  ChakraProvider, 
  Box, 
  VStack, 
  extendTheme,
  ColorModeScript 
} from '@chakra-ui/react';
import Header from './components/Header/Header';

// Custom theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      }
    }
  }
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <VStack spacing={0} align="stretch" minHeight="100vh">
        <Header 
          title="Teams Meeting" 
          user={{
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://bit.ly/dan-abramov'
          }}
        />
        <Box 
          as="main" 
          flex="1" 
          mt="4rem"  // Account for fixed header height
          p={4}
        >
          {/* Your main content goes here */}
          <Box>
            Welcome to Teams Meeting Application
          </Box>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}

export default App;
