import { IMessage } from "../interface/IMessage";
import { IUser, IUserBanco } from "../interface/IUser";

import server from "../config/server";
import ServiceUser from "../services/user";
import {
  IDataAuth,
  IDataLogin,
  IDataRegContact,
  IDataRegister,
} from "../interface/IData";
import { HashProvider } from "../Provider/hash";

const dbMessage: Array<IMessage> = [];

const connection = server.ioConnection.on("connection", (socket) => {
  const serviceUser = new ServiceUser();
  socket.on("chat", (data) => {
    const message: IMessage = {
      userSend: socket.id,
      timeMessageSend: new Date().toString(),
      messages: data.messages,
    };

    dbMessage.push(message);
    socket.broadcast.emit("getMessages", dbMessage);
  });

  socket.on("getMessages", (data) => {
    socket.emit("getMessages", dbMessage);
  });

  socket.on("login", (data: IDataLogin) => {
    const userFound = serviceUser.findUserByEmail(data.email);

    if (!userFound) {
      socket.emit("Error", {
        status: 404,
        message: "User not Found",
      });
    } else {
      const hashProvider = new HashProvider();
      var userLogin = hashProvider.compare(
        data.password,
        userFound.password && userFound.password
      );
      console.log(userLogin);
      if (!userLogin) {
        socket.emit("Error", {
          status: 404,
          message: "Credentials invalid, verify your parameters",
        });
      } else {
        // if userFound
        socket.emit("Logado");
      }
    }
  });

  socket.on("registerContact", (data: IDataRegContact) => {
    if (!serviceUser.findUserByEmail(data.userEmail)) {
      socket.emit("Error", {
        status: 404,
        message: "User not found",
      });
    } else {
      const saveContact = serviceUser.insertContact(data);

      if (saveContact?.status !== 200) {
        socket.emit("Error", saveContact);
      } else {
        socket.emit("Success", saveContact);
      }
    }
  });
  // Não mexa pq está com BO
  socket.on("registerGroup", (data: IDataRegContact) => {
    if (!serviceUser.findUserByEmail(data.userEmail)) {
      socket.emit("Error", {
        status: 404,
        message: "User not found",
      });
    } else {
      const saveContact = serviceUser.insertContact(data);

      if (saveContact?.status !== 200) {
        socket.emit("Error", saveContact);
      } else {
        socket.emit("Success", saveContact);
      }
    }
  });

  socket.on("getAllList", (data: IDataAuth) => {
    const user: IUser = serviceUser.findUserByEmail(data.email);
    if (!user) {
      socket.emit("Error", {
        status: 404,
        message: "User not found",
      });
    } else {
      socket.emit("Success", {
        listContact: user.listContacts,
        listGroups: user.listGroups,
        user: user.email,
      });
    }
  });

  socket.on("register", (data: IDataRegister) => {
    const userFound = serviceUser.findUserByEmail(data.email);

    if (userFound) {
      socket.emit("Error", {
        status: 404,
        message: "User already exists",
      });
    } else {
      const dataService = serviceUser.createUser(data);
      // if userFound
      if (dataService.status === 404) {
        socket.emit("Error", dataService);
      } else {
        socket.emit("User created with successfully");
      }
    }
  });
});

export default [connection];
