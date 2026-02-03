const User = require('../../lib/schema/users.schema');

const googleAuthDal = {
  registerWithGoogle: async (oauthUser) => {
    
    const isUserExists = await User.findOne({
      email: oauthUser.payload.email,
      isGoogleAuth: true,
    });

    let response;

    if (isUserExists) {
      // const userExist = {
      //   message: 'User already registered with Google.',
      // };

      response = {
        id: isUserExists._id,
        firstName: isUserExists?.firstName,
        lastName: isUserExists?.lastName,
        email: isUserExists?.email,
        phone: isUserExists?.phone,
        role: isUserExists?.role
      };

      return { response };
    }


    const userData = {
      isGoogleAuth: true,
      email:oauthUser.payload.email,
      profileImg:oauthUser.payload.picture,
      firstName: oauthUser.payload.name,
    };

    

    // Check if the email exists for non-Google authenticated users
    if (oauthUser.emails && oauthUser.emails.length > 0) {
      const userWithEmailExists = await User.findOne({ email: oauthUser.emails[0].value });
      if (userWithEmailExists) {
        const failure = {
          message: 'Email already registered. Sign in using your email/password.',
        };
        return { failure };
      }
      userData.email = oauthUser.emails[0].value;
    }

   const user = new User(userData);
   const newUser= await user.save();

   response = {
    id: newUser._id,
    firstName: newUser?.firstName,
    lastName: newUser?.lastName,
    email: newUser?.email,
    phone: newUser?.phone,
    role: newUser?.role
  };


    const success = {
      message: 'User registered successfully with Google.',
    };
    return { response };
  },
};

module.exports = googleAuthDal;
