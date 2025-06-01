/**
 * Generates an X.509 certificate from the given description.
 *
 * If the issuer key pair is provided, the certificate will be signed
 * using the provided issuer's private key. Otherwise, the certificate
 * will be self-signed.
 *
 * The code below is underdocumented. The following links may provide
 * more clarity about X.509, ASN.1, DER, PEM, and other data formats
 * this module encodes:
 *
 * * https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/
 * * https://dev.to/wayofthepie/structure-of-an-ssl-x-509-certificate-16b
 * * https://www.oss.com/asn1/resources/asn1-made-simple/asn1-quick-reference/asn1-tags.html
 */
export declare function generateCertificate(description: TBSCertificateDescription, issuerKeyPair?: CryptoKeyPair): Promise<GeneratedCertificate>;
export declare function certificateToPEM(certificate: Uint8Array): string;
export declare function privateKeyToPEM(privateKey: CryptoKey): Promise<string>;
/**
 * OIDs used in X.509 certificates.
 *
 * Source: https://oidref.com/
 */
declare const oids: {
    readonly '1.2.840.113549.1.1.1': "rsaEncryption";
    readonly '1.2.840.113549.1.1.4': "md5WithRSAEncryption";
    readonly '1.2.840.113549.1.1.5': "sha1WithRSAEncryption";
    readonly '1.2.840.113549.1.1.7': "RSAES-OAEP";
    readonly '1.2.840.113549.1.1.8': "mgf1";
    readonly '1.2.840.113549.1.1.9': "pSpecified";
    readonly '1.2.840.113549.1.1.10': "RSASSA-PSS";
    readonly '1.2.840.113549.1.1.11': "sha256WithRSAEncryption";
    readonly '1.2.840.113549.1.1.12': "sha384WithRSAEncryption";
    readonly '1.2.840.113549.1.1.13': "sha512WithRSAEncryption";
    readonly '1.3.101.112': "EdDSA25519";
    readonly '1.2.840.10040.4.3': "dsa-with-sha1";
    readonly '1.3.14.3.2.7': "desCBC";
    readonly '1.3.14.3.2.26': "sha1";
    readonly '1.3.14.3.2.29': "sha1WithRSASignature";
    readonly '2.16.840.1.101.3.4.2.1': "sha256";
    readonly '2.16.840.1.101.3.4.2.2': "sha384";
    readonly '2.16.840.1.101.3.4.2.3': "sha512";
    readonly '2.16.840.1.101.3.4.2.4': "sha224";
    readonly '2.16.840.1.101.3.4.2.5': "sha512-224";
    readonly '2.16.840.1.101.3.4.2.6': "sha512-256";
    readonly '1.2.840.113549.2.2': "md2";
    readonly '1.2.840.113549.2.5': "md5";
    readonly '1.2.840.113549.1.7.1': "data";
    readonly '1.2.840.113549.1.7.2': "signedData";
    readonly '1.2.840.113549.1.7.3': "envelopedData";
    readonly '1.2.840.113549.1.7.4': "signedAndEnvelopedData";
    readonly '1.2.840.113549.1.7.5': "digestedData";
    readonly '1.2.840.113549.1.7.6': "encryptedData";
    readonly '1.2.840.113549.1.9.1': "emailAddress";
    readonly '1.2.840.113549.1.9.2': "unstructuredName";
    readonly '1.2.840.113549.1.9.3': "contentType";
    readonly '1.2.840.113549.1.9.4': "messageDigest";
    readonly '1.2.840.113549.1.9.5': "signingTime";
    readonly '1.2.840.113549.1.9.6': "counterSignature";
    readonly '1.2.840.113549.1.9.7': "challengePassword";
    readonly '1.2.840.113549.1.9.8': "unstructuredAddress";
    readonly '1.2.840.113549.1.9.14': "extensionRequest";
    readonly '1.2.840.113549.1.9.20': "friendlyName";
    readonly '1.2.840.113549.1.9.21': "localKeyId";
    readonly '1.2.840.113549.1.9.22.1': "x509Certificate";
    readonly '1.2.840.113549.1.12.10.1.1': "keyBag";
    readonly '1.2.840.113549.1.12.10.1.2': "pkcs8ShroudedKeyBag";
    readonly '1.2.840.113549.1.12.10.1.3': "certBag";
    readonly '1.2.840.113549.1.12.10.1.4': "crlBag";
    readonly '1.2.840.113549.1.12.10.1.5': "secretBag";
    readonly '1.2.840.113549.1.12.10.1.6': "safeContentsBag";
    readonly '1.2.840.113549.1.5.13': "pkcs5PBES2";
    readonly '1.2.840.113549.1.5.12': "pkcs5PBKDF2";
    readonly '1.2.840.113549.1.12.1.1': "pbeWithSHAAnd128BitRC4";
    readonly '1.2.840.113549.1.12.1.2': "pbeWithSHAAnd40BitRC4";
    readonly '1.2.840.113549.1.12.1.3': "pbeWithSHAAnd3-KeyTripleDES-CBC";
    readonly '1.2.840.113549.1.12.1.4': "pbeWithSHAAnd2-KeyTripleDES-CBC";
    readonly '1.2.840.113549.1.12.1.5': "pbeWithSHAAnd128BitRC2-CBC";
    readonly '1.2.840.113549.1.12.1.6': "pbewithSHAAnd40BitRC2-CBC";
    readonly '1.2.840.113549.2.7': "hmacWithSHA1";
    readonly '1.2.840.113549.2.8': "hmacWithSHA224";
    readonly '1.2.840.113549.2.9': "hmacWithSHA256";
    readonly '1.2.840.113549.2.10': "hmacWithSHA384";
    readonly '1.2.840.113549.2.11': "hmacWithSHA512";
    readonly '1.2.840.113549.3.7': "des-EDE3-CBC";
    readonly '2.16.840.1.101.3.4.1.2': "aes128-CBC";
    readonly '2.16.840.1.101.3.4.1.22': "aes192-CBC";
    readonly '2.16.840.1.101.3.4.1.42': "aes256-CBC";
    readonly '2.5.4.3': "commonName";
    readonly '2.5.4.4': "surname";
    readonly '2.5.4.5': "serialNumber";
    readonly '2.5.4.6': "countryName";
    readonly '2.5.4.7': "localityName";
    readonly '2.5.4.8': "stateOrProvinceName";
    readonly '2.5.4.9': "streetAddress";
    readonly '2.5.4.10': "organizationName";
    readonly '2.5.4.11': "organizationalUnitName";
    readonly '2.5.4.12': "title";
    readonly '2.5.4.13': "description";
    readonly '2.5.4.15': "businessCategory";
    readonly '2.5.4.17': "postalCode";
    readonly '2.5.4.42': "givenName";
    readonly '1.3.6.1.4.1.311.60.2.1.2': "jurisdictionOfIncorporationStateOrProvinceName";
    readonly '1.3.6.1.4.1.311.60.2.1.3': "jurisdictionOfIncorporationCountryName";
    readonly '2.16.840.1.113730.1.1': "nsCertType";
    readonly '2.16.840.1.113730.1.13': "nsComment";
    readonly '2.5.29.14': "subjectKeyIdentifier";
    readonly '2.5.29.15': "keyUsage";
    readonly '2.5.29.17': "subjectAltName";
    readonly '2.5.29.18': "issuerAltName";
    readonly '2.5.29.19': "basicConstraints";
    readonly '2.5.29.31': "cRLDistributionPoints";
    readonly '2.5.29.32': "certificatePolicies";
    readonly '2.5.29.35': "authorityKeyIdentifier";
    readonly '2.5.29.37': "extKeyUsage";
    readonly '1.3.6.1.4.1.11129.2.4.2': "timestampList";
    readonly '1.3.6.1.5.5.7.1.1': "authorityInfoAccess";
    readonly '1.3.6.1.5.5.7.3.1': "serverAuth";
    readonly '1.3.6.1.5.5.7.3.2': "clientAuth";
    readonly '1.3.6.1.5.5.7.3.3': "codeSigning";
    readonly '1.3.6.1.5.5.7.3.4': "emailProtection";
    readonly '1.3.6.1.5.5.7.3.8': "timeStamping";
};
export interface DistinguishedName {
    countryName?: string;
    organizationName?: string;
    commonName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
    streetAddress?: string;
    postalCode?: string;
    emailAddress?: string;
    organizationalUnitName?: string;
    title?: string;
    description?: string;
    businessCategory?: string;
}
export type Validity = {
    notBefore: Date;
    notAfter: Date;
};
export type OID = keyof typeof oids;
export type OIDName = (typeof oids)[OID];
export interface BasicConstraints {
    ca: boolean;
    pathLenConstraint?: number;
}
export interface KeyUsage {
    digitalSignature?: boolean;
    nonRepudiation?: boolean;
    keyEncipherment?: boolean;
    dataEncipherment?: boolean;
    keyAgreement?: boolean;
    keyCertSign?: boolean;
    cRLSign?: boolean;
    encipherOnly?: boolean;
    decipherOnly?: boolean;
}
export interface ExtKeyUsage {
    serverAuth?: boolean;
    clientAuth?: boolean;
    codeSigning?: boolean;
    emailProtection?: boolean;
    timeStamping?: boolean;
}
export interface NSCertType {
    client?: boolean;
    server?: boolean;
    email?: boolean;
    objsign?: boolean;
    sslCA?: boolean;
    emailCA?: boolean;
    objCA?: boolean;
}
export interface SubjectAltNames {
    dnsNames?: string[];
    ipAddresses?: string[];
}
export interface TBSCertificateDescription {
    version?: number;
    serialNumber?: Uint8Array;
    signatureAlgorithm?: OIDName;
    issuer?: DistinguishedName;
    validity?: Validity;
    subject: DistinguishedName;
    basicConstraints?: BasicConstraints;
    keyUsage?: KeyUsage;
    extKeyUsage?: ExtKeyUsage;
    subjectAltNames?: SubjectAltNames;
    nsCertType?: NSCertType;
}
export type TBSCertificate = Uint8Array;
export type GeneratedCertificate = {
    keyPair: CryptoKeyPair;
    certificate: Uint8Array;
    tbsDescription: TBSCertificateDescription;
    tbsCertificate: TBSCertificate;
};
export {};
