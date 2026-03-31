export const calculateProfileCompletion = (user) => {

    const fields = [
        user.avatar,
        user.bio,
        user.education,
        user.location,
        user.hobbies?.length,
        user.salary,
        user.age,
        user.gender,
        user.mobileNo,
        user.full_name,
        user.email
    ];

    const filled = fields.filter(Boolean).length;

    return Math.round((filled / fields.length) * 100);
};
