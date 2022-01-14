---
id: user-management
title: How to add new users to your Unleash instance
---

> This feature was introduced in Unleash v4 for Unleash Open-Source.

You can add new users to Unleash in `Admin > Users`.

1. From the top-line menu – click on the “Settings Wheel” then click on “Users”.
    ![A visual representation of the current step: the Unleash Admin UI with the steps highlighted.](/img/user_admin_list_button.png)


2. To add a new user to your Unleash instance simply click the "Add user" button:
    ![The Unleash users page with the 'add new user' button being pointed to.](/img/user_admin-add-user.jpg)

3. Fill out the required fields about the user in the modal. You need to choose which role the new user should have on the "root level". E.g. giving the user an Editor role will allow the user to create a new project.

    ![A form titled "Add team member". It has the fields "full name", "email", and "role". The role field is a radio button set with roles called "admin", "editor", and "viewer".](/img/user_admin_add_user_modal.png)

    If you have configured an email server the user will receive the invite link in her inbox, otherwise you should share the magic invite link to Unleash presented in the confirmation dialogue.
