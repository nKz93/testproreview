"use client"
import { useUser } from '@/hooks/useUser';
import { QRCodeGenerator } from '@/components/dashboard/QRCodeGenerator';

export default function QRCodesPage() {
  const { business } = useUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
        <p className="text-gray-500 mt-1">Generez des QR codes a afficher dans votre etablissement</p>
      </div>
      {business && <QRCodeGenerator business={business} />}
    </div>
  );
}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Créé le {formatDate(qr.created_at)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => downloadQR(qr)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Télécharger PNG
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
