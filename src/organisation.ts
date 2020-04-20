interface Credentials {
  username: string,
  password: string
}

class Organisation {
  constructor(
    public uuid: string,
    public name: string,
    public location: string,
  ) {}
}

export { Organisation as default };
