export interface BaseResponse<T> {
  data: T
  responseCode: number
  description: string
  timeStamp: string
  url: any
  objects: any
}
