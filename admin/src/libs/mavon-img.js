//uploadFileRequest请求
import $axios from 'axios';


export default function uploadImg(file, token) {

  let formdata = new FormData();
  formdata.append('file', file)
  formdata.append('token', token)

  let instance = $axios.create({
    headers: {
      token: token,
      'Content-Type': 'multipart/form-data'
    }
  })

  instance.post('http://up-z2.qiniu.com', formdata).then(res => {
    if (res === 200) {
      //this.$Message.success('上传成功')
      let url = res.data.key
      this.$refs.md.$img2Url(pos, 'http://qdm05omqc.bkt.clouddn.com/' + url)
    } else {
      //this.$Message.error(res.statusText)
    }
  })
}
