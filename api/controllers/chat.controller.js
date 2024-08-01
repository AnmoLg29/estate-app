import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      if (!receiverId) {
        continue; // Skip to the next chat if receiverId is not valid
      }

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      if (!receiver) {
        continue; // Skip to the next chat if receiver is not found
      }

      chat.receiver = receiver;
    }

    console.log("in get chats controller",chats);

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};


export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// export const addChat = async (req,res)=>{
//     const tokenUserId = req.userId
//     try {
//         const newChat = await prisma.chat.create({
//             data:{
//                 userIDs:[tokenUserId,req.body.receiverId]
//             }
//         })
//         res.status(200).json(newChat);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Failed to add chats!"})
//     }
// }

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;

  try {
      // Check if there's an existing chat with both receiverId and tokenUserId
      const existingChat = await prisma.chat.findFirst({
          where: {
              AND: [
                  { userIDs: { has: tokenUserId } },
                  { userIDs: { has: receiverId } }
              ]
          }
      });

      if (existingChat) {
          // If an existing chat is found, return it
          res.status(200).json(existingChat);
      } else {
          // If no existing chat is found, create a new one
          const newChat = await prisma.chat.create({
              data: {
                  userIDs: [tokenUserId, receiverId]
              }
          });
          res.status(200).json(newChat);
      }
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req,res)=>{
    const tokenUserId = req.userId;

    try {
        const chat = await prisma.chat.update({
            where:{
                id:req.params.id,
                userIDs:{
                    hasSome:[tokenUserId],
                },
            },
            data:{
                seenBy:{
                    set:[tokenUserId],
                },
            },
        });
        
        res.status(200).json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to read chats!"})
    }
}