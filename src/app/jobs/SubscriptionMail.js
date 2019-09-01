import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `Nova inscrição | ${meetup.title}`,
      text: ` Olá, ${meetup.User.name}

 Aqui está a nova inscrição para ${meetup.title}:

Inscrito: ${user.name}
E-Mail: ${user.email}

____________________
Equipe GoMeetApp
`,
      template: 'subscription',
      context: {
        user,
        meetup,
      },
    });
  }
}

export default new SubscriptionMail();
