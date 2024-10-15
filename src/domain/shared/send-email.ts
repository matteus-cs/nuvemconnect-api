
export type dataType = {
  from: {
    name: string,
    address: string
  }
  to: string | {
    name: string,
    address: string
  }
  subject: string,
  html: string
}

export interface SendMail {
  handle(data: dataType): Promise<void>
}