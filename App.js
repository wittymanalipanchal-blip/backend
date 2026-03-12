import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TextInput, Button, FlatList, View } from "react-native";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState("");

  const BASE_URL = "http://192.168.1.100:5000"; 
  const login = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        fetchClients(data.token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async (authToken) => {
    try {
      const res = await fetch(`${BASE_URL}/api/client`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addClient = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/client/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newClientName }),
      });
      const data = await res.json();
      setClients([...clients, data]);
      setNewClientName("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
        />
        <Button title="Login" onPress={login} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Clients List</Text>

      <FlatList
        data={clients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="New Client Name"
        value={newClientName}
        onChangeText={setNewClientName}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <Button title="Add Client" onPress={addClient} />
    </SafeAreaView>
  );
}